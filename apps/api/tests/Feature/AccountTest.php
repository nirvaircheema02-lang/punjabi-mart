<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Password;
use Tests\TestCase;

class AccountTest extends TestCase
{
    use RefreshDatabase;

    public function test_registration_returns_customer_role_and_ignores_escalation(): void
    {
        $this->postJson('/api/register', ['name' => 'Test Owner', 'email' => 'OWNER@example.com', 'password' => 'test-password-123', 'password_confirmation' => 'test-password-123', 'role' => 'admin'])->assertOk()->assertJsonPath('user.role', 'customer')->assertJsonPath('user.email', 'owner@example.com')->assertJsonMissingPath('user.password');
        $this->getJson('/api/manage')->assertForbidden();
    }

    public function test_seller_application_requires_admin_approval(): void
    {
        $user = User::factory()->create();
        $this->actingAs($user);
        $this->postJson('/api/seller-application', ['name' => 'Test Shop', 'city' => 'Ludhiana', 'speciality' => 'Phulkari', 'since' => 2020])->assertOk();
        $this->getJson('/api/seller-application')->assertJsonPath('application.status', 'pending');
        $this->getJson('/api/manage')->assertForbidden();
        $this->postJson('/api/seller-application', ['name' => 'Another Shop', 'city' => 'Ludhiana', 'speciality' => 'Craft', 'since' => 2020])->assertConflict();
    }

    public function test_customer_cannot_change_another_accounts_address(): void
    {
        $owner = User::factory()->create();
        $this->actingAs($owner);
        $address = ['name' => 'Buyer', 'phone' => '9876543210', 'line1' => 'Test', 'city' => 'Ludhiana', 'state' => 'Punjab', 'pincode' => '141001'];
        $id = $this->postJson('/api/addresses', $address)->assertOk()->json('0.id');
        $this->actingAs(User::factory()->create())->postJson('/api/addresses', [...$address, 'id' => $id])->assertNotFound();
        $this->getJson('/api/addresses')->assertExactJson([]);
    }

    public function test_password_recovery_normalizes_email_like_sign_in(): void
    {
        Notification::fake();
        $user = User::factory()->create(['email' => 'buyer@example.com']);
        $this->postJson('/api/forgot-password', ['email' => ' BUYER@EXAMPLE.COM '])->assertOk();
        Notification::assertSentTo($user, ResetPassword::class);
        $token = Password::createToken($user);
        $this->postJson('/api/reset-password', ['email' => ' BUYER@EXAMPLE.COM ', 'token' => $token, 'password' => 'new-password-123', 'password_confirmation' => 'new-password-123'])->assertOk();
        $this->assertTrue(Hash::check('new-password-123', $user->fresh()->password));
    }
}
