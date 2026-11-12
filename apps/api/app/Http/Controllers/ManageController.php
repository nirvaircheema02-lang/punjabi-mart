<?php

namespace App\Http\Controllers;

use App\Services\Shop;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class ManageController extends Controller
{
    private function staff(Request $r): void
    {
        abort_unless(in_array($r->user()->role, ['admin', 'seller']), 403);
        if ($r->user()->role === 'seller') {
            abort_unless(DB::table('shops')->where('id', $r->user()->seller_id)->where('status', 'approved')->exists(), 403, 'Your shop is not approved.');
        }
    }

    private function admin(Request $r): void
    {
        abort_unless($r->user()->role === 'admin', 403);
    }

    public function index(Request $r)
    {
        $this->staff($r);
        $seller = $r->user()->role === 'seller' ? $r->user()->seller_id : null;
        $products = DB::table('products')->when($seller, fn ($q) => $q->where('seller_id', $seller))->latest()->get()->map(fn ($p) => Shop::product($p));
        $orders = DB::table('orders')->when($seller, fn ($q) => $q->whereIn('id', DB::table('shipments')->select('order_id')->where('seller_id', $seller)))->latest()->limit(300)->get()->map(fn ($o) => Shop::order($o, $seller));

        return ['products' => $products, 'orders' => $orders, 'shops' => DB::table('shops')->when($seller, fn ($q) => $q->where('id', $seller))->get(), 'settings' => Shop::settings(), 'messages' => $seller ? [] : DB::table('messages')->latest()->limit(100)->get(), 'subscribers' => $seller ? 0 : DB::table('subscribers')->count(), 'audit' => $seller ? [] : DB::table('audit_events')->latest('id')->limit(50)->get()];
    }

    public function product(Request $r, ?string $id = null)
    {
        $this->staff($r);
        $existing = $id ? DB::table('products')->where('id', $id)->first() : null;
        if ($id) {
            abort_unless($existing, 404);
        }
        $seller = $r->user()->role === 'seller';
        if ($seller && $existing) {
            abort_unless($existing->seller_id === $r->user()->seller_id, 403);
        }
        $categories = json_decode(file_get_contents(database_path('seeders/data/categories.json')), true);
        $d = $r->validate(['title' => 'required|string|max:180', 'category' => ['required', Rule::in(array_column($categories, 'slug'))], 'price' => 'required|numeric|min:1|max:1000000', 'mrp' => 'required|numeric|gte:price|max:1000000', 'stock' => 'required|integer|min:0|max:1000000', 'description' => 'nullable|string|max:5000', 'material' => 'nullable|string|max:300', 'care' => 'nullable|string|max:500', 'status' => 'required|in:draft,pending,active,archived', 'sellerId' => 'nullable|exists:shops,id', 'isDemo' => 'required|boolean', 'commission' => 'nullable|numeric|min:0|max:100', 'variant' => 'nullable|array', 'variantStocks' => 'nullable|array|max:900', 'variantStocks.*' => 'required|integer|min:0|max:1000000', 'variant.label' => 'required_with:variant|string|max:80', 'variant.options' => 'required_with:variant|array|min:1|max:30', 'variant.options.*' => 'required|string|max:50|distinct', 'variant.outOfStock' => 'sometimes|array', 'variant.outOfStock.*' => 'string|max:50', 'variant.secondary' => 'nullable|array', 'variant.secondary.label' => 'required_with:variant.secondary|string|max:80', 'variant.secondary.options' => 'required_with:variant.secondary|array|min:1|max:30', 'variant.secondary.options.*' => 'required|string|max:50|distinct', 'image' => 'nullable|string|max:500']);
        if (! empty($d['image']) && ! preg_match('#^/media/products/[a-zA-Z0-9._-]+\.(jpg|jpeg|png|webp)$#', $d['image'])) {
            Shop::fail('image', 'Use an uploaded product image.');
        }
        $category = collect($categories)->firstWhere('slug', $d['category']);
        $details = $existing ? json_decode($existing->details, true) : [];
        $details = array_merge($details, array_intersect_key($d, array_flip(['description', 'material', 'care', 'image'])));
        $details['kind'] = $category['kind'] ?? 'lifestyle';
        $details['art'] = $category['art'];
        $details['variant'] = $d['variant'] ?? null;
        $details['requiresVariant'] = ! empty($d['variant']);
        if (! empty($d['variant'])) {
            $keys = [];
            foreach ($d['variant']['options'] as $primary) {
                foreach ($d['variant']['secondary']['options'] ?? [null] as $secondary) {
                    $keys[] = $primary.($secondary === null ? '' : ' · '.$secondary);
                }
            }
            $given = $d['variantStocks'] ?? null;
            if ($given !== null && (array_map('strval', array_keys($given)) !== array_map('strval', $keys) || count($given) !== count($keys))) {
                Shop::fail('variantStocks', 'Set stock for every option shown.');
            }
            if ($given === null) {
                $old = $details['variantStocks'] ?? null;
                if ($old !== null && array_map('strval', array_keys($old)) === array_map('strval', $keys)) {
                    $given = $old;
                } else {
                    $per = intdiv((int) $d['stock'], count($keys));
                    $remaining = (int) $d['stock'] % count($keys);
                    $given = [];
                    foreach ($keys as $key) {
                        $given[$key] = $per + ($remaining-- > 0 ? 1 : 0);
                    }
                }
            }
            $details['variantStocks'] = $given;
            $details['variant']['outOfStock'] = array_values(array_filter($d['variant']['options'], fn ($primary) => collect($given)->filter(fn ($count, $key) => $key === $primary || str_starts_with($key, $primary.' · '))->sum() === 0));
            $d['stock'] = array_sum($given);
        } else {
            unset($details['variantStocks']);
        }

        $id = $existing?->id ?? (string) Str::uuid();
        $data = ['id' => $id, 'slug' => $existing?->slug ?? Str::slug($d['title']).'-'.substr($id, 0, 8), 'title' => $d['title'], 'category' => $d['category'], 'price' => (int) round($d['price'] * 100), 'mrp' => (int) round($d['mrp'] * 100), 'stock' => $d['stock'], 'status' => $seller ? ($d['status'] === 'archived' ? 'archived' : 'pending') : $d['status'], 'seller_id' => $seller ? $r->user()->seller_id : ($d['sellerId'] ?? null), 'is_demo' => $seller ? (bool) ($existing?->is_demo ?? false) : $d['isDemo'], 'commission_bps' => $seller ? ($existing?->commission_bps) : (isset($d['commission']) ? (int) round($d['commission'] * 100) : null), 'details' => json_encode($details), 'updated_at' => now()];
        DB::transaction(function () use ($data, $id, $existing, $r) {
            if ($existing) {
                DB::table('products')->where('id', $id)->lockForUpdate()->first();
            } DB::table('products')->updateOrInsert(['id' => $id], [...$data, 'created_at' => $existing?->created_at ?? now()]);
            Shop::audit($r->user()->id, 'product.saved', $id, ['status' => $data['status'], 'stock' => $data['stock'], 'price' => $data['price']]);
        });

        return ['product' => Shop::product(DB::table('products')->where('id', $id)->first())];
    }

    public function stock(Request $r, string $id)
    {
        $this->staff($r);
        $d = $r->validate(['stock' => 'required|integer|min:0|max:1000000']);
        DB::transaction(function () use ($r, $id, $d) {
            $p = DB::table('products')->where('id', $id)->lockForUpdate()->first();
            abort_unless($p, 404);
            abort_unless($r->user()->role === 'admin' || $p->seller_id === $r->user()->seller_id, 403);
            if (isset(json_decode($p->details, true)['variantStocks'])) {
                Shop::fail('stock', 'Edit each option stock in the product editor.');
            }
            DB::table('products')->where('id', $id)->update([...$d, 'updated_at' => now()]);
            Shop::audit($r->user()->id, 'stock.updated', $id, $d);
        });

        return ['ok' => true];
    }

    public function upload(Request $r)
    {
        $this->staff($r);
        $r->validate(['image' => 'required|image|mimes:jpg,jpeg,png,webp|max:5120']);
        $path = $r->file('image')->store('products', 'public');

        return ['image' => '/media/'.$path];
    }

    public function shop(Request $r, string $id)
    {
        $this->admin($r);
        $d = $r->validate(['status' => 'required|in:pending,approved,suspended', 'commission' => 'nullable|numeric|min:0|max:100']);
        DB::transaction(function () use ($r, $id, $d) {
            $shop = DB::table('shops')->where('id', $id)->lockForUpdate()->first();
            abort_unless($shop, 404);
            DB::table('shops')->where('id', $id)->update(['status' => $d['status'], 'commission_bps' => isset($d['commission']) ? (int) round($d['commission'] * 100) : null, 'updated_at' => now()]);
            if ($shop->user_id) {
                DB::table('users')->where('id', $shop->user_id)->update(['role' => 'seller', 'seller_id' => $id]);
            }Shop::audit($r->user()->id, 'shop.reviewed', $id, $d);
        });

        return ['ok' => true];
    }

    public function shipment(Request $r, string $id)
    {
        $this->staff($r);
        $d = $r->validate(['status' => 'required|in:confirmed,packed,shipped,delivered,cancelled', 'tracking' => 'nullable|string|max:100', 'carrier' => 'nullable|string|max:100']);
        DB::transaction(function () use ($r, $id, $d) {
            $s = DB::table('shipments')->where('id', $id)->first();
            abort_unless($s, 404);
            abort_unless($r->user()->role === 'admin' || $s->seller_id === $r->user()->seller_id, 403);
            DB::table('orders')->where('id', $s->order_id)->lockForUpdate()->first();
            $s = DB::table('shipments')->where('id', $id)->lockForUpdate()->first();
            $next = ['placed' => ['confirmed', 'cancelled'], 'confirmed' => ['packed', 'cancelled'], 'packed' => ['shipped'], 'shipped' => ['delivered'], 'delivered' => [], 'cancelled' => []];
            if (! in_array($d['status'], $next[$s->status] ?? [])) {
                Shop::fail('status', 'This status transition is not available. Refresh the order.');
            }
            if ($d['status'] === 'shipped' && (empty($d['tracking']) || empty($d['carrier']))) {
                Shop::fail('tracking', 'Carrier and tracking number are required to ship.');
            }
            if ($d['status'] === 'cancelled') {
                foreach (json_decode($s->lines, true) as $l) {
                    Shop::adjustStock($l['productId'], $l['variant'] ?? null, $l['qty']);
                }
            }
            DB::table('shipments')->where('id', $id)->update([...$d, 'updated_at' => now()]);
            Shop::audit($r->user()->id, 'shipment.updated', $id, $d);
        }, 3);

        return ['ok' => true];
    }

    public function payment(Request $r, string $id)
    {
        $this->admin($r);
        $r->validate(['status' => 'required|in:collected']);
        $o = DB::table('orders')->where('id', $id)->first();
        abort_unless($o, 404);
        abort_if(DB::table('shipments')->where('order_id', $id)->whereNotIn('status', ['delivered', 'cancelled'])->exists(), 422, 'Complete deliveries before recording COD collection.');
        abort_unless(DB::table('shipments')->where('order_id', $id)->where('status', 'delivered')->exists(), 422, 'No delivered shipment.');
        DB::table('orders')->where('id', $id)->update(['payment_status' => 'collected', 'updated_at' => now()]);
        Shop::audit($r->user()->id, 'cod.collected', $id);

        return ['ok' => true];
    }

    public function settings(Request $r)
    {
        $this->admin($r);
        $d = $r->validate(['freeDeliveryThreshold' => 'required|numeric|min:0|max:1000000', 'deliveryFee' => 'required|numeric|min:0|max:10000', 'codEnabled' => 'required|boolean', 'checkoutEnabled' => 'required|boolean', 'commission' => 'required|numeric|min:0|max:100', 'supportEmail' => 'nullable|email|max:190', 'serviceablePrefixes' => 'required|array|max:1000', 'serviceablePrefixes.*' => ['required', 'regex:/^[1-9][0-9]{0,5}$/'], 'categoryCommissions' => 'sometimes|array', 'categoryCommissions.*' => 'numeric|min:0|max:100']);
        DB::transaction(function () use ($r, $d) {
            foreach ($d as $k => $v) {
                DB::table('shop_settings')->updateOrInsert(['key' => $k], ['value' => json_encode($v)]);
            }Shop::audit($r->user()->id, 'settings.updated', 'shop');
        });

        return ['settings' => Shop::settings()];
    }

    public function message(Request $r, string $id)
    {
        $this->admin($r);
        $d = $r->validate(['resolved' => 'required|boolean']);
        DB::table('messages')->where('id', $id)->update($d);

        return ['ok' => true];
    }
}
