<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;

class Settlement
{
    public static function summary(?string $sellerId = null): array
    {
        $shops = DB::table('shops')->when($sellerId, fn ($query) => $query->where('id', $sellerId))->get();

        return $shops->map(function ($shop) {
            $shipments = DB::table('shipments')
                ->join('orders', 'orders.id', '=', 'shipments.order_id')
                ->where('shipments.seller_id', $shop->id)
                ->where('shipments.status', 'delivered')
                ->where('orders.payment_status', 'collected')
                ->select('shipments.*')
                ->get();
            $earned = $shipments->sum(fn ($shipment) => collect(json_decode($shipment->lines, true))
                ->sum(fn ($line) => (int) round(($line['price'] * $line['qty'] - $line['commission']) * 100)));
            $issues = DB::table('order_issues')->whereIn('shipment_id', $shipments->pluck('id'))->get();
            // A refunded item reverses only the seller's share of its refunded amount.
            $refunds = $issues->whereIn('status', ['refunded', 'closed'])->sum(function ($issue) use ($shipments) {
                if (! $issue->refund_paise) {
                    return 0;
                }
                $shipment = $shipments->firstWhere('id', $issue->shipment_id);
                $line = collect(json_decode($shipment->lines, true))->first(fn ($line) => $line['productId'] === $issue->product_id && ($line['variant'] ?? null) === $issue->variant);
                if (! $line) {
                    return 0;
                }
                $gross = (int) round($line['price'] * $line['qty'] * 100);
                $commission = (int) round($line['commission'] * 100);

                return $gross ? (int) round($issue->refund_paise * ($gross - $commission) / $gross) : 0;
            });
            $held = $issues->whereIn('status', ['submitted', 'needs_info', 'approved_replacement', 'replacement_shipped', 'refund_due'])
                ->sum(function ($issue) use ($shipments) {
                    $shipment = $shipments->firstWhere('id', $issue->shipment_id);
                    $line = collect(json_decode($shipment->lines, true))->first(fn ($line) => $line['productId'] === $issue->product_id && ($line['variant'] ?? null) === $issue->variant);

                    return $line ? (int) round(($line['price'] * $line['qty'] - $line['commission']) * 100) : 0;
                });
            $paid = DB::table('seller_payouts')->where('seller_id', $shop->id)->sum('amount_paise');
            $payable = $earned - $refunds - $held - $paid;

            return [
                'sellerId' => $shop->id, 'shop' => $shop->name,
                'earned' => $earned / 100, 'refunded' => $refunds / 100,
                'held' => $held / 100, 'paid' => $paid / 100,
                'available' => max(0, $payable) / 100,
                'overpaid' => max(0, -$payable) / 100,
            ];
        })->all();
    }
}
