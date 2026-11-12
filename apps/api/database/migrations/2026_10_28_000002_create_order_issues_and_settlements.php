<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('order_issues', function (Blueprint $table) {
            $table->id();
            $table->string('order_id');
            $table->foreign('order_id')->references('id')->on('orders');
            $table->foreignId('shipment_id')->constrained('shipments');
            $table->foreignId('user_id')->constrained('users');
            $table->string('product_id');
            $table->string('variant')->nullable();
            $table->string('variant_key')->default('');
            $table->string('reason');
            $table->string('remedy');
            $table->string('status')->default('submitted');
            $table->text('customer_note');
            $table->text('seller_note')->nullable();
            $table->text('admin_note')->nullable();
            $table->unsignedInteger('refund_paise')->default(0);
            $table->string('refund_reference')->nullable();
            $table->string('replacement_tracking')->nullable();
            $table->timestamps();
            $table->unique(['shipment_id', 'product_id', 'variant_key']);
        });
        Schema::create('seller_payouts', function (Blueprint $table) {
            $table->id();
            $table->string('seller_id');
            $table->foreign('seller_id')->references('id')->on('shops');
            $table->unsignedInteger('amount_paise');
            $table->string('reference')->unique();
            $table->text('note')->nullable();
            $table->foreignId('recorded_by')->constrained('users');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('seller_payouts');
        Schema::dropIfExists('order_issues');
    }
};
