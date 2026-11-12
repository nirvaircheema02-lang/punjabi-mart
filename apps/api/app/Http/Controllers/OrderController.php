<?php

namespace App\Http\Controllers;

use App\Services\Shop;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class OrderController extends Controller
{
    public function index(Request $r)
    {
        return DB::table('orders')->where('user_id', $r->user()->id)->latest()->get()->map(fn ($o) => Shop::order($o));
    }

    private function quote(array $data, bool $lock = false): array
    {
        $settings = Shop::settings();
        if (! $settings['checkoutEnabled']) {
            Shop::fail('checkout', 'Ordering is not open yet. Please check back soon.');
        }
        if (! $settings['codEnabled']) {
            Shop::fail('payment', 'Cash on delivery is currently unavailable.');
        }
        $pin = $data['address']['pincode'];
        if (! $settings['serviceablePrefixes'] || ! collect($settings['serviceablePrefixes'])->contains(fn ($prefix) => str_starts_with($pin, $prefix))) {
            Shop::fail('pincode', 'Delivery is not available to this pincode yet.');
        }
        $ids = array_unique(array_column($data['lines'], 'productId'));
        sort($ids);
        $query = Shop::catalog()->whereIn('products.id', $ids)->orderBy('products.id');
        $products = ($lock ? $query->lockForUpdate() : $query)->get()->keyBy('id');
        $used = [];
        $usedByVariant = [];
        $keys = [];
        $lines = [];
        $subtotal = 0;
        foreach ($data['lines'] as $item) {
            $p = $products->get($item['productId']);
            if (! $p) {
                Shop::fail('cart', 'An item is no longer available. Refresh your cart.');
            }
            $key = $p->id.'|'.($item['variant'] ?? '');
            if (isset($keys[$key])) {
                Shop::fail('cart', 'Duplicate cart lines. Refresh your cart.');
            } $keys[$key] = true;
            Shop::validateVariant($p, $item['variant'] ?? null);
            $details = json_decode($p->details, true);
            if (isset($details['variantStocks'])) {
                $selection = $item['variant'] ?? '';
                $variantKey = $p->id.'|'.$selection;
                $usedByVariant[$variantKey] = ($usedByVariant[$variantKey] ?? 0) + $item['qty'];
                if ($usedByVariant[$variantKey] > ($details['variantStocks'][$selection] ?? 0)) {
                    Shop::fail('stock', 'This option is out of stock or has insufficient quantity.');
                }
            }
            $used[$p->id] = ($used[$p->id] ?? 0) + $item['qty'];
            if ($used[$p->id] > $p->stock) {
                Shop::fail('stock', "Only {$p->stock} units of {$p->title} are available.");
            }
            $rate = $p->seller_id ? ($p->commission_bps ?? DB::table('shops')->where('id', $p->seller_id)->value('commission_bps') ?? (int) round(($settings['categoryCommissions'][$p->category] ?? $settings['commission']) * 100)) : 0;
            $sum = $p->price * $item['qty'];
            $subtotal += $sum;
            $lines[] = ['productId' => $p->id, 'slug' => $p->slug, 'title' => $p->title, 'variant' => $item['variant'] ?? null, 'qty' => $item['qty'], 'price' => $p->price / 100, 'sellerId' => $p->seller_id, 'commission' => round($sum * $rate / 10000) / 100];
        }
        $shipping = $subtotal >= (int) round($settings['freeDeliveryThreshold'] * 100) ? 0 : (int) round($settings['deliveryFee'] * 100);

        return ['lines' => $lines, 'subtotal' => $subtotal / 100, 'shipping' => $shipping / 100, 'total' => ($subtotal + $shipping) / 100, 'demo' => $settings['demo']];
    }

    private function data(Request $r): array
    {
        $d = $r->validate(['lines' => 'required|array|min:1|max:100', 'lines.*.productId' => 'required|string|max:100', 'lines.*.qty' => 'required|integer|min:1|max:20', 'lines.*.variant' => 'nullable|string|max:200', 'address' => 'required|array']);
        $d['address'] = Validator::make($d['address'], Shop::addressRules())->validate();

        return $d;
    }

    public function preview(Request $r)
    {
        return $this->quote($this->data($r));
    }

    public function store(Request $r)
    {
        $d = $this->data($r);
        $extra = $r->validate(['idempotencyKey' => 'required|uuid', 'expectedTotal' => 'required|numeric|min:0', 'payment' => 'required|in:cod']);
        $hash = hash('sha256', json_encode($d));

        return DB::transaction(function () use ($r, $d, $extra, $hash) {
            // Serialize submissions for a customer, including retries with the same key.
            DB::table('users')->where('id', $r->user()->id)->lockForUpdate()->first();
            $existing = DB::table('orders')->where('idempotency_key', $extra['idempotencyKey'])->first();
            if ($existing) {
                abort_unless($existing->user_id === $r->user()->id && $existing->request_hash === $hash, 409, 'This checkout request has already been used.');

                return Shop::order($existing);
            }
            $quote = $this->quote($d, true);
            if ((int) round($extra['expectedTotal'] * 100) !== (int) round($quote['total'] * 100)) {
                Shop::fail('total', 'Prices have changed. Review your order again.');
            }
            $id = 'PM-'.strtoupper(Str::random(12));
            DB::table('orders')->insert(['id' => $id, 'user_id' => $r->user()->id, 'idempotency_key' => $extra['idempotencyKey'], 'request_hash' => $hash, 'subtotal' => round($quote['subtotal'] * 100), 'shipping' => round($quote['shipping'] * 100), 'total' => round($quote['total'] * 100), 'payment' => 'cod', 'payment_status' => 'unpaid', 'is_demo' => $quote['demo'], 'address' => json_encode($d['address']), 'created_at' => now(), 'updated_at' => now()]);
            foreach (collect($quote['lines'])->groupBy(fn ($l) => $l['sellerId'] ?? 'platform') as $seller => $lines) {
                DB::table('shipments')->insert(['order_id' => $id, 'seller_id' => $seller === 'platform' ? null : $seller, 'status' => 'placed', 'lines' => $lines->toJson(), 'created_at' => now(), 'updated_at' => now()]);
            }
            foreach ($quote['lines'] as $line) {
                Shop::adjustStock($line['productId'], $line['variant'], -$line['qty']);
            }
            Shop::audit($r->user()->id, 'order.created', $id);

            return Shop::order(DB::table('orders')->where('id', $id)->first());
        }, 3);
    }

    public function cancel(Request $r, string $id)
    {
        DB::transaction(function () use ($r, $id) {
            $o = DB::table('orders')->where('id', $id)->where('user_id', $r->user()->id)->lockForUpdate()->first();
            abort_unless($o, 404);
            $shipments = DB::table('shipments')->where('order_id', $id)->lockForUpdate()->get();
            if ($shipments->contains(fn ($s) => ! in_array($s->status, ['placed', 'confirmed', 'cancelled']))) {
                Shop::fail('order', 'This order has entered packing or shipping. Contact support.');
            }
            foreach ($shipments as $s) {
                if ($s->status !== 'cancelled') {
                    foreach (json_decode($s->lines, true) as $l) {
                        Shop::adjustStock($l['productId'], $l['variant'] ?? null, $l['qty']);
                    } DB::table('shipments')->where('id', $s->id)->update(['status' => 'cancelled', 'updated_at' => now()]);
                }
            }
            Shop::audit($r->user()->id, 'order.cancelled', $id);
        }, 3);

        return $this->index($r);
    }
}
