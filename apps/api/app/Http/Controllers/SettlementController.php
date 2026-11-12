<?php

namespace App\Http\Controllers;

use App\Services\Settlement;
use App\Services\Shop;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SettlementController extends Controller
{
    public function index(Request $request)
    {
        abort_unless(in_array($request->user()->role, ['admin', 'seller']), 403);
        $seller = $request->user()->role === 'seller' ? $request->user()->seller_id : null;
        if ($seller) {
            abort_unless(DB::table('shops')->where('id', $seller)->where('status', 'approved')->exists(), 403);
        }

        return ['summary' => Settlement::summary($seller), 'payouts' => DB::table('seller_payouts')->when($seller, fn ($query) => $query->where('seller_id', $seller))->latest()->limit(100)->get()];
    }

    public function record(Request $request)
    {
        abort_unless($request->user()->role === 'admin', 403);
        $data = $request->validate([
            'sellerId' => 'required|exists:shops,id', 'amount' => 'required|numeric|gt:0|max:1000000',
            'reference' => 'required|string|max:100|unique:seller_payouts,reference', 'note' => 'nullable|string|max:1000',
        ]);

        return DB::transaction(function () use ($request, $data) {
            DB::table('shops')->where('id', $data['sellerId'])->lockForUpdate()->first();
            $available = collect(Settlement::summary($data['sellerId']))->first()['available'] ?? 0;
            if (round($data['amount'] * 100) > round($available * 100)) {
                Shop::fail('amount', 'Amount exceeds the available seller balance.');
            }
            DB::table('seller_payouts')->insert([
                'seller_id' => $data['sellerId'], 'amount_paise' => (int) round($data['amount'] * 100),
                'reference' => $data['reference'], 'note' => $data['note'] ?? null,
                'recorded_by' => $request->user()->id, 'created_at' => now(), 'updated_at' => now(),
            ]);
            Shop::audit($request->user()->id, 'seller.payout_recorded', $data['sellerId'], ['amount' => $data['amount'], 'reference' => $data['reference']]);

            return $this->index($request);
        });
    }
}
