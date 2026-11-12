<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Services\Shop;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules\Password as PasswordRule;

class AccountController extends Controller
{
    public function session(Request $r)
    {
        return ['csrf' => csrf_token(), 'user' => $r->user(), 'wishlist' => $r->user()?->wishlist ?? [], 'emailOtpEnabled' => OtpController::enabled()];
    }

    public function register(Request $r)
    {
        $r->merge(['email' => strtolower(trim((string) $r->input('email')))]);
        $d = $r->validate(['name' => 'required|string|max:100', 'email' => 'required|email|max:190|unique:users', 'password' => ['required', 'confirmed', PasswordRule::min(10)]]);
        $user = User::create($d)->refresh();
        Auth::login($user);
        $r->session()->regenerate();

        return $this->session($r);
    }

    public function login(Request $r)
    {
        $r->merge(['email' => strtolower(trim((string) $r->input('email')))]);
        $d = $r->validate(['email' => 'required|email', 'password' => 'required|string']);
        if (! Auth::attempt($d)) {
            Shop::fail('email', 'Email or password is incorrect.');
        }
        $r->session()->regenerate();

        return $this->session($r);
    }

    public function logout(Request $r)
    {
        Auth::logout();
        $r->session()->invalidate();
        $r->session()->regenerateToken();

        return ['csrf' => csrf_token()];
    }

    public function profile(Request $r)
    {
        $d = $r->validate(['name' => 'required|string|max:100']);
        $r->user()->update($d);

        return $this->session($r);
    }

    public function password(Request $r)
    {
        $d = $r->validate(['current_password' => 'required|current_password', 'password' => ['required', 'confirmed', PasswordRule::min(10)]]);
        $r->user()->update(['password' => Hash::make($d['password'])]);
        DB::table('sessions')->where('user_id', $r->user()->id)->where('id', '!=', $r->session()->getId())->delete();

        return ['message' => 'Password updated. Other sessions have been signed out.'];
    }

    public function forgot(Request $r)
    {
        $r->merge(['email' => strtolower(trim((string) $r->input('email')))]);
        $d = $r->validate(['email' => 'required|email']);
        if (in_array(config('mail.default'), ['log', 'array']) && ! app()->environment('testing')) {
            Shop::fail('email', 'Password reset email is not configured yet. Please contact support.');
        }
        Password::sendResetLink($d);

        return ['message' => 'If this email has an account, a password reset link has been sent.'];
    }

    public function reset(Request $r)
    {
        $r->merge(['email' => strtolower(trim((string) $r->input('email')))]);
        $d = $r->validate(['email' => 'required|email', 'token' => 'required|string', 'password' => ['required', 'confirmed', PasswordRule::min(10)]]);
        $status = Password::reset($d, function (User $u, string $p) {
            $u->forceFill(['password' => Hash::make($p), 'remember_token' => Str::random(60)])->save();
            DB::table('sessions')->where('user_id', $u->id)->delete();
        });
        if ($status !== Password::PASSWORD_RESET) {
            Shop::fail('token', 'This reset link is invalid or expired. Request a new one.');
        }

        return ['message' => 'Password reset. You can now sign in.'];
    }

    public function wishlist(Request $r)
    {
        $d = $r->validate(['productId' => 'required|exists:products,id', 'saved' => 'required|boolean']);
        $u = $r->user();
        DB::transaction(function () use ($u, $d) {
            $u = User::lockForUpdate()->findOrFail($u->id);
            $ids = array_diff($u->wishlist ?? [], [$d['productId']]);
            if ($d['saved']) {
                $ids[] = $d['productId'];
            } $u->wishlist = array_values($ids);
            $u->save();
        });

        return ['ok' => true];
    }

    public function addresses(Request $r)
    {
        return DB::table('addresses')->where('user_id', $r->user()->id)->get()->map(fn ($a) => ['id' => $a->id, ...json_decode($a->details, true)]);
    }

    public function saveAddress(Request $r)
    {
        $d = $r->validate(Shop::addressRules());
        $id = $r->input('id');
        $q = DB::table('addresses')->where('user_id', $r->user()->id);
        if ($id) {
            abort_unless((clone $q)->where('id', $id)->exists(), 404);
            $q->where('id', $id)->update(['details' => json_encode($d), 'updated_at' => now()]);
        } else {
            abort_if($q->count() >= 20, 422, 'Maximum 20 saved addresses.');
            DB::table('addresses')->insert(['user_id' => $r->user()->id, 'details' => json_encode($d), 'created_at' => now(), 'updated_at' => now()]);
        }

        return $this->addresses($r);
    }

    public function deleteAddress(Request $r, string $id)
    {
        DB::table('addresses')->where('user_id', $r->user()->id)->where('id', $id)->delete();

        return $this->addresses($r);
    }
}
