<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class Shop
{
    public static function settings(): array
    {
        $defaults = ['freeDeliveryThreshold' => 999, 'deliveryFee' => 79, 'codEnabled' => false, 'checkoutEnabled' => false, 'commission' => 10, 'supportEmail' => '', 'serviceablePrefixes' => [], 'categoryCommissions' => []];
        $stored = DB::table('shop_settings')->pluck('value', 'key')->map(fn ($v) => json_decode($v, true))->all();

        return array_merge($defaults, $stored, ['demo' => (bool) config('commerce.demo')]);
    }

    public static function product(object $p): array
    {
        return array_merge(json_decode($p->details, true), ['id' => $p->id, 'slug' => $p->slug, 'title' => $p->title, 'category' => $p->category, 'sellerId' => $p->seller_id, 'ownerType' => $p->seller_id ? 'seller' : 'platform', 'price' => $p->price / 100, 'mrp' => $p->mrp / 100, 'stock' => $p->stock, 'status' => $p->status, 'inStock' => $p->stock > 0, 'isDemo' => (bool) $p->is_demo, 'commission' => $p->commission_bps === null ? null : $p->commission_bps / 100]);
    }

    public static function catalog()
    {
        return DB::table('products')->where('status', 'active')->when(! config('commerce.demo'), fn ($q) => $q->where('is_demo', false))->where(fn ($q) => $q->whereNull('seller_id')->orWhereIn('seller_id', DB::table('shops')->select('id')->where('status', 'approved')));
    }

    public static function addressRules(): array
    {
        return ['name' => 'required|string|max:100', 'phone' => ['required', 'regex:/^[6-9][0-9]{9}$/'], 'line1' => 'required|string|max:200', 'line2' => 'nullable|string|max:200', 'city' => 'required|string|max:100', 'state' => 'required|string|max:100', 'pincode' => ['required', 'regex:/^[1-9][0-9]{5}$/']];
    }

    public static function validateVariant(object $p, ?string $selection): void
    {
        $d = json_decode($p->details, true);
        if (empty($d['requiresVariant'])) {
            if ($selection) {
                self::fail('variant', 'This item does not have variants.');
            }

            return;
        }
        $v = $d['variant'] ?? [];
        $parts = explode(' · ', $selection ?? '');
        if (! in_array($parts[0], $v['options'] ?? [], true) || in_array($parts[0], $v['outOfStock'] ?? [], true)) {
            self::fail('variant', "Choose an available option for {$p->title}.");
        }
        if (isset($v['secondary']) ? count($parts) !== 2 || ! in_array($parts[1], $v['secondary']['options'], true) : count($parts) !== 1) {
            self::fail('variant', "Choose all options for {$p->title}.");
        }
    }

    public static function adjustStock(string $id, ?string $variant, int $delta): void
    {
        $product = DB::table('products')->where('id', $id)->lockForUpdate()->first();
        if (! $product) {
            return;
        }
        $details = json_decode($product->details, true);
        if ($variant !== null && isset($details['variantStocks'])) {
            $current = $details['variantStocks'][$variant] ?? 0;
            if ($current + $delta < 0) {
                self::fail('stock', 'This option is out of stock.');
            }
            $details['variantStocks'][$variant] = $current + $delta;
        }
        if ($product->stock + $delta < 0) {
            self::fail('stock', 'The item is out of stock.');
        }
        DB::table('products')->where('id', $id)->update([
            'stock' => $product->stock + $delta,
            'details' => json_encode($details), 'updated_at' => now(),
        ]);
    }

    public static function fail(string $field, string $message): never
    {
        throw ValidationException::withMessages([$field => $message]);
    }

    public static function audit(int $user, string $action, string $subject, array $details = []): void
    {
        DB::table('audit_events')->insert(['user_id' => $user, 'action' => $action, 'subject' => $subject, 'details' => json_encode($details), 'created_at' => now()]);
    }

    public static function order(object $o, ?string $seller = null): array
    {
        $shipments = DB::table('shipments')->where('order_id', $o->id)->when($seller, fn ($q) => $q->where('seller_id', $seller))->get()->map(function ($s) {
            $s->lines = json_decode($s->lines, true);

            return $s;
        });
        $o->address = json_decode($o->address, true);
        $o->is_demo = (bool) $o->is_demo;
        unset($o->request_hash,$o->idempotency_key);
        foreach (['subtotal', 'shipping', 'total'] as $key) {
            $o->$key /= 100;
        }
        if ($seller) {
            $o->subtotal = $shipments->sum(fn ($s) => collect($s->lines)->sum(fn ($l) => $l['price'] * $l['qty']));
            $o->shipping = null;
            $o->total = $o->subtotal;
            unset($o->user_id);
        }

        return [...(array) $o, 'shipments' => $shipments];
    }
}
