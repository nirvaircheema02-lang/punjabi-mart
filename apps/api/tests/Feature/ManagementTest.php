<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class ManagementTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        config(['commerce.demo' => true]);
        $this->seed();
    }

    private function user(string $role, ?string $shop = null): User
    {
        $u = User::factory()->create();
        $u->role = $role;
        $u->seller_id = $shop;
        $u->save();

        return $u;
    }

    private function productData(): array
    {
        return ['title' => 'Owner test product', 'category' => 'turbans', 'price' => 500, 'mrp' => 600, 'stock' => 4, 'status' => 'active', 'isDemo' => true, 'sellerId' => null];
    }

    public function test_customer_and_guest_cannot_access_management(): void
    {
        $this->getJson('/api/manage')->assertUnauthorized();
        $this->actingAs($this->user('customer'))->getJson('/api/manage')->assertForbidden();
    }

    public function test_admin_can_publish_own_inventory_without_a_seller(): void
    {
        $count = DB::table('products')->count();
        $response = $this->actingAs($this->user('admin'))->postJson('/api/manage/products', $this->productData())->assertOk();
        $response->assertJsonPath('product.ownerType', 'platform')->assertJsonPath('product.sellerId', null);
        $this->getJson('/api/catalog')->assertJsonFragment(['title' => 'Owner test product']);
        $this->assertSame($count + 1, DB::table('products')->count());
    }

    public function test_seller_cannot_publish_or_claim_platform_ownership(): void
    {
        $response = $this->actingAs($this->user('seller', 's1'))->postJson('/api/manage/products', $this->productData())->assertOk();
        $response->assertJsonPath('product.sellerId', 's1')->assertJsonPath('product.status', 'pending');
        $foreign = DB::table('products')->where('seller_id', 's2')->first();
        $this->patchJson('/api/manage/products/'.$foreign->id, $this->productData())->assertForbidden();
        $this->patchJson('/api/manage/shops/s2', ['status' => 'approved'])->assertForbidden();
    }

    public function test_suspended_seller_loses_management_access(): void
    {
        DB::table('shops')->where('id', 's1')->update(['status' => 'suspended']);
        $this->actingAs($this->user('seller', 's1'))->getJson('/api/manage')->assertForbidden();
    }
}
