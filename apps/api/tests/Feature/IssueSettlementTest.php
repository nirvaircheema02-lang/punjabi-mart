<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Tests\TestCase;

class IssueSettlementTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        config(['commerce.demo' => true]);
        $this->seed();
    }

    private function deliveredOrder(): array
    {
        $buyer = User::factory()->create();
        $admin = User::factory()->create();
        $admin->role = 'admin';
        $admin->save();
        $product = DB::table('products')->where('seller_id', 's1')->where('stock', '>', 0)->first();
        DB::table('products')->where('id', $product->id)->update(['price' => 100000, 'stock' => 5, 'details' => json_encode(['requiresVariant' => false])]);
        DB::table('shops')->where('id', 's1')->update(['commission_bps' => 1000]);
        $body = [
            'lines' => [['productId' => $product->id, 'qty' => 1]],
            'address' => ['name' => 'Buyer', 'phone' => '9876543210', 'line1' => 'One Street', 'city' => 'Ludhiana', 'state' => 'Punjab', 'pincode' => '141001'],
            'payment' => 'cod', 'expectedTotal' => 1000, 'idempotencyKey' => (string) Str::uuid(),
        ];
        $order = $this->actingAs($buyer)->postJson('/api/orders', $body)->assertOk()->json();
        $shipment = DB::table('shipments')->where('order_id', $order['id'])->first();
        DB::table('shipments')->where('id', $shipment->id)->update(['status' => 'delivered']);
        DB::table('orders')->where('id', $order['id'])->update(['payment_status' => 'collected']);

        return [$buyer, $admin, $product, $shipment];
    }

    public function test_customer_reports_own_delivered_item_once(): void
    {
        [$buyer, , $product, $shipment] = $this->deliveredOrder();
        $payload = ['shipmentId' => $shipment->id, 'productId' => $product->id, 'reason' => 'damaged', 'remedy' => 'replacement', 'note' => 'The item arrived damaged.'];
        $this->actingAs($buyer)->postJson('/api/issues', $payload)->assertOk()->assertJsonPath('0.status', 'submitted');
        $this->postJson('/api/issues', $payload)->assertConflict();
        $this->actingAs(User::factory()->create())->getJson('/api/issues')->assertExactJson([]);
        $this->postJson('/api/issues', $payload)->assertNotFound();
    }

    public function test_issue_holds_balance_and_refund_reduces_seller_share(): void
    {
        [$buyer, $admin, $product, $shipment] = $this->deliveredOrder();
        $this->actingAs($admin)->getJson('/api/settlements')->assertJsonPath('summary.0.available', 900);
        $this->actingAs($buyer)->postJson('/api/issues', ['shipmentId' => $shipment->id, 'productId' => $product->id, 'reason' => 'damaged', 'remedy' => 'refund', 'note' => 'The item arrived damaged.'])->assertOk();
        $this->actingAs($admin)->getJson('/api/settlements')->assertJsonPath('summary.0.available', 0);
        $id = DB::table('order_issues')->first()->id;
        $this->patchJson("/api/issues/$id", ['status' => 'refund_due', 'adminNote' => 'Approved after inspection.'])->assertOk();
        $this->patchJson("/api/issues/$id", ['status' => 'refunded', 'adminNote' => 'Customer transfer completed.', 'refundAmount' => 1000, 'refundReference' => 'BANK-1'])->assertOk();
        $this->getJson('/api/settlements')->assertJsonPath('summary.0.refunded', 900)->assertJsonPath('summary.0.available', 0);
        $this->patchJson("/api/issues/$id", ['status' => 'closed', 'adminNote' => 'Resolved.'])->assertOk();
        $this->getJson('/api/settlements')->assertJsonPath('summary.0.refunded', 900);
    }

    public function test_manual_payout_is_bounded_and_unique(): void
    {
        [, $admin] = $this->deliveredOrder();
        $this->actingAs($admin)->postJson('/api/settlements/payouts', ['sellerId' => 's1', 'amount' => 901, 'reference' => 'BANK-1'])->assertUnprocessable();
        $this->postJson('/api/settlements/payouts', ['sellerId' => 's1', 'amount' => 500, 'reference' => 'BANK-1'])->assertOk()->assertJsonPath('summary.0.available', 400);
        $this->postJson('/api/settlements/payouts', ['sellerId' => 's1', 'amount' => 500, 'reference' => 'BANK-1'])->assertUnprocessable();
        $this->assertDatabaseCount('seller_payouts', 1);
    }

    public function test_seller_cannot_decide_refund_or_see_other_seller_issue(): void
    {
        [$buyer, , $product, $shipment] = $this->deliveredOrder();
        $this->actingAs($buyer)->postJson('/api/issues', ['shipmentId' => $shipment->id, 'productId' => $product->id, 'reason' => 'wrong_item', 'remedy' => 'replacement', 'note' => 'This is not the ordered item.'])->assertOk();
        $seller = User::factory()->create();
        $seller->role = 'seller';
        $seller->seller_id = 's1';
        $seller->save();
        $this->actingAs($seller)->getJson('/api/issues')->assertJsonCount(1);
        $this->patchJson('/api/issues/1', ['status' => 'refunded', 'adminNote' => 'Attempt'])->assertUnprocessable();
        $this->patchJson('/api/issues/1', ['sellerNote' => 'We are checking this.'])->assertOk();
        $other = User::factory()->create();
        $other->role = 'seller';
        $other->seller_id = 's2';
        $other->save();
        $this->actingAs($other)->getJson('/api/issues')->assertExactJson([]);
        $this->patchJson('/api/issues/1', ['sellerNote' => 'Wrong seller'])->assertForbidden();
    }
}
