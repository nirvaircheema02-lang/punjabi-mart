<?php

namespace App\Http\Controllers;

use App\Services\Shop;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class IssueController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $query = DB::table('order_issues');
        if ($user->role === 'seller') {
            abort_unless(DB::table('shops')->where('id', $user->seller_id)->where('status', 'approved')->exists(), 403);
            $query->whereIn('shipment_id', DB::table('shipments')->select('id')->where('seller_id', $user->seller_id));
        } elseif ($user->role !== 'admin') {
            $query->where('user_id', $user->id);
        }

        return $query->latest()->get();
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'shipmentId' => 'required|integer', 'productId' => 'required|string|max:100', 'variant' => 'nullable|string|max:200',
            'reason' => ['required', Rule::in(['damaged', 'defective', 'wrong_item', 'not_as_described', 'late'])],
            'remedy' => ['required', Rule::in(['replacement', 'refund'])],
            'note' => 'required|string|min:10|max:2000',
        ]);
        $shipment = DB::table('shipments')->where('id', $data['shipmentId'])->first();
        abort_unless($shipment, 404);
        $order = DB::table('orders')->where('id', $shipment->order_id)->where('user_id', $request->user()->id)->first();
        abort_unless($order, 404);
        abort_unless($shipment->status === 'delivered', 422, 'Please contact support for an undelivered order.');
        $line = collect(json_decode($shipment->lines, true))->first(fn ($line) => $line['productId'] === $data['productId'] && ($line['variant'] ?? null) === ($data['variant'] ?? null));
        abort_unless($line, 422, 'This product is not part of the shipment.');
        $exists = DB::table('order_issues')->where('shipment_id', $shipment->id)->where('product_id', $data['productId'])->where('variant_key', $line['variant'] ?? '')->exists();
        abort_if($exists, 409, 'An issue has already been reported for this item.');
        DB::table('order_issues')->insert([
            'order_id' => $order->id, 'shipment_id' => $shipment->id, 'user_id' => $request->user()->id,
            'product_id' => $data['productId'], 'variant' => $line['variant'] ?? null, 'variant_key' => $line['variant'] ?? '',
            'reason' => $data['reason'], 'remedy' => $data['remedy'], 'status' => 'submitted',
            'customer_note' => $data['note'], 'created_at' => now(), 'updated_at' => now(),
        ]);
        Shop::audit($request->user()->id, 'issue.submitted', $order->id, ['productId' => $data['productId']]);

        return $this->index($request);
    }

    public function update(Request $request, string $id)
    {
        abort_unless(in_array($request->user()->role, ['admin', 'seller']), 403);
        $issue = DB::table('order_issues')->where('id', $id)->first();
        abort_unless($issue, 404);
        $shipment = DB::table('shipments')->where('id', $issue->shipment_id)->first();
        abort_unless($request->user()->role === 'admin' || $shipment->seller_id === $request->user()->seller_id, 403);
        if ($request->user()->role === 'seller') {
            $data = $request->validate(['sellerNote' => 'required|string|min:5|max:2000']);
            DB::table('order_issues')->where('id', $id)->update(['seller_note' => $data['sellerNote'], 'updated_at' => now()]);
        } else {
            $data = $request->validate([
                'status' => ['required', Rule::in(['needs_info', 'approved_replacement', 'replacement_shipped', 'refund_due', 'refunded', 'rejected', 'closed'])],
                'adminNote' => 'required|string|min:5|max:2000',
                'refundAmount' => 'nullable|numeric|min:0|max:1000000',
                'refundReference' => 'nullable|string|max:100',
                'replacementTracking' => 'nullable|string|max:100',
            ]);
            $allowed = [
                'submitted' => ['needs_info', 'approved_replacement', 'refund_due', 'rejected'],
                'needs_info' => ['approved_replacement', 'refund_due', 'rejected'],
                'approved_replacement' => ['replacement_shipped', 'refund_due'],
                'replacement_shipped' => ['closed'],
                'refund_due' => ['refunded'],
                'refunded' => ['closed'], 'rejected' => [], 'closed' => [],
            ];
            if (! in_array($data['status'], $allowed[$issue->status] ?? [], true)) {
                Shop::fail('status', 'This change is not available. Refresh the issue.');
            }
            if ($data['status'] === 'replacement_shipped' && empty($data['replacementTracking'])) {
                Shop::fail('replacementTracking', 'Enter the replacement tracking number.');
            }
            if ($data['status'] === 'refunded') {
                if (empty($data['refundReference']) || empty($data['refundAmount'])) {
                    Shop::fail('refundReference', 'Record the actual refund amount and transfer reference.');
                }
                $line = collect(json_decode($shipment->lines, true))->first(fn ($line) => $line['productId'] === $issue->product_id && ($line['variant'] ?? null) === $issue->variant);
                $max = (int) round($line['price'] * $line['qty'] * 100);
                if ((int) round($data['refundAmount'] * 100) > $max) {
                    Shop::fail('refundAmount', 'Refund cannot exceed the item amount.');
                }
            }
            DB::table('order_issues')->where('id', $id)->update([
                'status' => $data['status'], 'admin_note' => $data['adminNote'],
                'refund_paise' => $data['status'] === 'refunded' ? (int) round($data['refundAmount'] * 100) : $issue->refund_paise,
                'refund_reference' => $data['status'] === 'refunded' ? $data['refundReference'] : $issue->refund_reference,
                'replacement_tracking' => $data['replacementTracking'] ?? $issue->replacement_tracking,
                'updated_at' => now(),
            ]);
        }
        Shop::audit($request->user()->id, 'issue.updated', $id, $data);

        return $this->index($request);
    }
}
