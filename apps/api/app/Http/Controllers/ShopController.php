<?php

namespace App\Http\Controllers;

use App\Services\Shop;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ShopController extends Controller
{
    public function catalog()
    {
        return ['products' => Shop::catalog()->get()->map(fn ($p) => Shop::product($p)), 'sellers' => DB::table('shops')->where('status', 'approved')->get(['id', 'name', 'city', 'speciality', 'story', 'since']), 'settings' => Shop::settings()];
    }

    public function subscribe(Request $r)
    {
        $d = $r->validate(['email' => 'required|email|max:190', 'consent' => 'accepted']);
        DB::table('subscribers')->insertOrIgnore(['email' => $d['email'], 'created_at' => now(), 'updated_at' => now()]);

        return ['message' => 'You are on the list. Thank you!'];
    }

    public function contact(Request $r)
    {
        $d = $r->validate(['name' => 'required|string|max:100', 'email' => 'required|email|max:190', 'message' => 'required|string|min:10|max:5000']);
        DB::table('messages')->insert([...$d, 'created_at' => now(), 'updated_at' => now()]);

        return ['message' => 'Your message has been saved for our support team.'];
    }

    public function apply(Request $r)
    {
        abort_if($r->user()->role !== 'customer', 409, 'You already have a staff account.');
        $d = $r->validate(['name' => 'required|string|max:150', 'city' => 'required|string|max:100', 'speciality' => 'required|string|max:500', 'story' => 'nullable|string|max:2000', 'since' => 'required|integer|min:1900|max:'.date('Y')]);
        $existing = DB::table('shops')->where('user_id', $r->user()->id)->first();
        abort_if($existing, 409, 'Your application is already submitted.');
        $id = (string) Str::uuid();
        DB::table('shops')->insert([...$d, 'id' => $id, 'user_id' => $r->user()->id, 'status' => 'pending', 'created_at' => now(), 'updated_at' => now()]);

        return ['message' => 'Application received. Your shop will be reviewed before you can publish products.'];
    }

    public function application(Request $r)
    {
        return ['application' => DB::table('shops')->where('user_id', $r->user()->id)->first()];
    }
}
