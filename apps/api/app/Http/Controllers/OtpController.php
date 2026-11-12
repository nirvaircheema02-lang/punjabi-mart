<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Services\Shop;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\RateLimiter;

class OtpController extends Controller
{
    public static function enabled(): bool
    {
        $canDeliver = ! in_array(config('mail.default'), ['log', 'array']) || app()->environment('testing');

        return (bool) config('commerce.email_otp') && $canDeliver;
    }

    private function available(): void
    {
        abort_unless(self::enabled(), 503, 'Email code sign-in is not available yet. Use your password.');
    }

    public function request(Request $request)
    {
        $this->available();
        $request->merge(['email' => strtolower(trim((string) $request->input('email')))]);
        $data = $request->validate(['email' => 'required|email|max:190']);
        $limit = 'otp:'.hash('sha256', $data['email']);
        if (RateLimiter::tooManyAttempts($limit, 1)) {
            return response()->json(['message' => 'Please wait before requesting another code.', 'retryAfter' => RateLimiter::availableIn($limit)], 429);
        }
        RateLimiter::hit($limit, 60);
        $code = (string) random_int(100000, 999999);
        $user = User::where('email', $data['email'])->first();
        $request->session()->put('login_otp', [
            'user_id' => $user?->id, 'hash' => Hash::make($code),
            'expires' => now()->addMinutes(5)->timestamp, 'attempts' => 0,
        ]);
        if ($user) {
            Mail::raw("Your PunjabiMarts sign-in code is {$code}. It expires in 5 minutes. Do not share this code. If you did not request it, ignore this email.", function ($message) use ($data) {
                $message->to($data['email'])->subject('Your PunjabiMarts sign-in code');
            });
        }

        return ['message' => 'If this email has an account, a code has been sent. New here? Create an account first.', 'retryAfter' => 60];
    }

    public function verify(Request $request)
    {
        $this->available();
        $data = $request->validate(['code' => ['required', 'regex:/^[0-9]{6}$/']]);
        $challenge = $request->session()->get('login_otp');
        if (! $challenge || $challenge['expires'] <= now()->timestamp || $challenge['attempts'] >= 5) {
            $request->session()->forget('login_otp');
            Shop::fail('code', 'Your code expired or has too many attempts. Request a new code.');
        }
        $challenge['attempts']++;
        $request->session()->put('login_otp', $challenge);
        $valid = Hash::check($data['code'], $challenge['hash']);
        $user = $challenge['user_id'] ? User::find($challenge['user_id']) : null;
        if (! $valid || ! $user) {
            Shop::fail('code', 'That code is incorrect. Check the six digits and try again.');
        }
        $request->session()->forget('login_otp');
        Auth::login($user);
        $request->session()->regenerate();

        return app(AccountController::class)->session($request);
    }
}
