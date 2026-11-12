<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Tests\TestCase;

class CheckoutTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        config(['commerce.demo' => true]);
        $this->seed();
        $this->actingAs(User::factory()->create());
    }

    private function checkout(): array
    {
        $p = DB::table('products')->where('stock', '>', 0)->first();
        DB::table('products')->where('id', $p->id)->update(['price' => 100000, 'stock' => 5, 'seller_id' => 's1', 'details' => json_encode(['requiresVariant' => false])]);

        return ['lines' => [['productId' => $p->id, 'qty' => 1]], 'address' => ['name' => 'Test Buyer', 'phone' => '9876543210', 'line1' => 'Test address', 'city' => 'Ludhiana', 'state' => 'Punjab', 'pincode' => '141001'], 'expectedTotal' => 1000, 'payment' => 'cod', 'idempotencyKey' => (string) Str::uuid()];
    }

    public function test_retry_decrements_once_and_cancellation_restores_once(): void
    {
        $b = $this->checkout();
        $id = $this->postJson('/api/orders', $b)->assertOk()->json('id');
        $this->postJson('/api/orders', $b)->assertOk()->assertJsonPath('id', $id);
        $this->assertDatabaseCount('orders', 1);
        $this->assertDatabaseHas('products', ['id' => $b['lines'][0]['productId'], 'stock' => 4]);
        $this->postJson("/api/orders/$id/cancel")->assertOk();
        $this->postJson("/api/orders/$id/cancel")->assertOk();
        $this->assertDatabaseHas('products', ['id' => $b['lines'][0]['productId'], 'stock' => 5]);
    }

    public function test_tampered_total_and_insufficient_stock_are_rejected(): void
    {
        $b = $this->checkout();
        $this->postJson('/api/orders', [...$b, 'expectedTotal' => 1])->assertUnprocessable();
        $b['lines'][0]['qty'] = 6;
        $this->postJson('/api/orders', $b)->assertUnprocessable();
        $this->assertDatabaseCount('orders', 0);
    }

    public function test_changed_retry_and_other_customer_access_are_rejected(): void
    {
        $b = $this->checkout();
        $id = $this->postJson('/api/orders', $b)->assertOk()->json('id');
        $b['lines'][0]['qty'] = 2;
        $this->postJson('/api/orders', $b)->assertConflict();
        $this->actingAs(User::factory()->create())->postJson("/api/orders/$id/cancel")->assertNotFound();
        $this->getJson('/api/orders')->assertExactJson([]);
    }

    public function test_commission_is_fixed_at_order_time_and_own_products_have_zero_commission(): void
    {
        $b = $this->checkout();
        DB::table('shops')->where('id', 's1')->update(['commission_bps' => 1500]);
        $this->postJson('/api/orders', $b)->assertOk()->assertJsonPath('shipments.0.lines.0.commission', 150);
        DB::table('shops')->where('id', 's1')->update(['commission_bps' => 2500]);
        $this->getJson('/api/orders')->assertJsonPath('0.shipments.0.lines.0.commission', 150);
        DB::table('products')->where('id', $b['lines'][0]['productId'])->update(['seller_id' => null]);
        $b['idempotencyKey'] = (string) Str::uuid();
        $this->postJson('/api/orders', $b)->assertOk()->assertJsonPath('shipments.0.lines.0.commission', 0);
    }

    public function test_all_variant_choices_are_required(): void
    {
        $b = $this->checkout();
        DB::table('products')->where('id', $b['lines'][0]['productId'])->update(['details' => json_encode(['requiresVariant' => true, 'variant' => ['options' => ['M'], 'secondary' => ['options' => ['Blue']]]])]);
        $b['lines'][0]['variant'] = 'M';
        $this->postJson('/api/orders', $b)->assertUnprocessable();
        $b['lines'][0]['variant'] = 'M · Blue';
        $this->postJson('/api/orders', $b)->assertOk();
    }

    public function test_option_stock_is_reserved_and_restored_separately(): void
    {
        $body = $this->checkout();
        $productId = $body['lines'][0]['productId'];
        DB::table('products')->where('id', $productId)->update([
            'stock' => 3,
            'details' => json_encode([
                'requiresVariant' => true,
                'variant' => ['label' => 'Size', 'options' => ['M', 'L']],
                'variantStocks' => ['M' => 1, 'L' => 2],
            ]),
        ]);
        $body['lines'][0]['variant'] = 'M';
        $order = $this->postJson('/api/orders', $body)->assertOk()->json('id');
        $product = DB::table('products')->where('id', $productId)->first();
        $this->assertSame(0, json_decode($product->details, true)['variantStocks']['M']);
        $this->assertSame(2, json_decode($product->details, true)['variantStocks']['L']);
        $this->postJson('/api/orders', [...$body, 'idempotencyKey' => (string) Str::uuid()])->assertUnprocessable();
        $this->postJson("/api/orders/$order/cancel")->assertOk();
        $this->assertSame(1, json_decode(DB::table('products')->where('id', $productId)->value('details'), true)['variantStocks']['M']);
    }
}
