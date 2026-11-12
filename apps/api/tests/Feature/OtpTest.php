<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class OtpTest extends TestCase
{
    use RefreshDatabase;

    private function challenge(int $userId, array $override = []): array
    {
        return array_merge(['user_id' => $userId, 'hash' => Hash::make('123456'), 'expires' => now()->addMinutes(5)->timestamp, 'attempts' => 0], $override);
    }

    public function test_otp_is_disabled_until_explicitly_configured(): void
    {
        config(['commerce.email_otp' => false]);
        $this->postJson('/api/otp/request', ['email' => 'buyer@example.com'])->assertStatus(503);
    }

    public function test_valid_code_logs_in_and_cannot_be_reused(): void
    {
        config(['commerce.email_otp' => true]);
        $user = User::factory()->create();
        $this->withSession(['login_otp' => $this->challenge($user->id)])
            ->postJson('/api/otp/verify', ['code' => '123456'])->assertOk()->assertJsonPath('user.id', $user->id)->assertSessionMissing('login_otp');
        $this->postJson('/api/otp/verify', ['code' => '123456'])->assertUnprocessable();
    }

    public function test_wrong_expired_and_exhausted_codes_do_not_log_in(): void
    {
        config(['commerce.email_otp' => true]);
        $user = User::factory()->create();
        $this->withSession(['login_otp' => $this->challenge($user->id)])
            ->postJson('/api/otp/verify', ['code' => '654321'])->assertUnprocessable()->assertSessionHas('login_otp.attempts', 1);
        $this->assertGuest();
        $this->withSession(['login_otp' => $this->challenge($user->id, ['expires' => now()->subMinute()->timestamp])])
            ->postJson('/api/otp/verify', ['code' => '123456'])->assertUnprocessable();
        $this->withSession(['login_otp' => $this->challenge($user->id, ['attempts' => 5])])
            ->postJson('/api/otp/verify', ['code' => '123456'])->assertUnprocessable();
        $this->assertGuest();
    }

    public function test_request_is_generic_and_resend_is_limited(): void
    {
        config(['commerce.email_otp' => true, 'mail.default' => 'array']);
        $user = User::factory()->create();
        $first = $this->postJson('/api/otp/request', ['email' => $user->email])->assertOk()->assertJsonMissingPath('code');
        $this->postJson('/api/otp/request', ['email' => 'missing@example.com'])->assertOk()->assertExactJson($first->json());
        $this->postJson('/api/otp/request', ['email' => $user->email])->assertStatus(429);
    }

    public function test_capability_is_hidden_when_mail_only_logs(): void
    {
        config(['commerce.email_otp' => true, 'mail.default' => 'log']);
        $this->app->instance('env', 'local');
        $this->getJson('/api/session')->assertOk()->assertJsonPath('emailOtpEnabled', false);
    }

    public function test_code_expires_at_its_exact_deadline(): void
    {
        config(['commerce.email_otp' => true]);
        $user = User::factory()->create();
        $this->withSession(['login_otp' => $this->challenge($user->id, ['expires' => now()->timestamp])])
            ->postJson('/api/otp/verify', ['code' => '123456'])->assertUnprocessable();
        $this->assertGuest();
    }
}
