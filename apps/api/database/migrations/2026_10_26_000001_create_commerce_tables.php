<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
 public function up(): void {
  Schema::table('users', function(Blueprint $t) { $t->string('role')->default('customer'); $t->string('seller_id')->nullable(); $t->json('wishlist')->nullable(); });
  Schema::create('shops', function(Blueprint $t) { $t->string('id')->primary(); $t->foreignId('user_id')->nullable()->unique()->constrained('users'); $t->string('name'); $t->string('city'); $t->text('speciality'); $t->text('story')->nullable(); $t->unsignedInteger('since'); $t->string('status')->default('pending'); $t->unsignedInteger('commission_bps')->nullable(); $t->timestamps(); });
  Schema::create('products', function(Blueprint $t) { $t->string('id')->primary(); $t->string('slug')->unique(); $t->string('seller_id')->nullable(); $t->foreign('seller_id')->references('id')->on('shops'); $t->string('title'); $t->string('category'); $t->unsignedInteger('price'); $t->unsignedInteger('mrp'); $t->unsignedInteger('stock')->default(0); $t->string('status')->default('draft'); $t->boolean('is_demo')->default(false); $t->unsignedInteger('commission_bps')->nullable(); $t->json('details'); $t->timestamps(); });
  Schema::create('addresses', function(Blueprint $t) { $t->id(); $t->foreignId('user_id')->constrained(); $t->json('details'); $t->timestamps(); });
  Schema::create('orders', function(Blueprint $t) { $t->string('id')->primary(); $t->foreignId('user_id')->constrained(); $t->uuid('idempotency_key')->unique(); $t->string('request_hash',64); $t->unsignedInteger('subtotal'); $t->unsignedInteger('shipping'); $t->unsignedInteger('total'); $t->string('payment'); $t->string('payment_status')->default('unpaid'); $t->boolean('is_demo'); $t->json('address'); $t->timestamps(); });
  Schema::create('shipments', function(Blueprint $t) { $t->id(); $t->string('order_id'); $t->foreign('order_id')->references('id')->on('orders'); $t->string('seller_id')->nullable(); $t->string('status')->default('placed'); $t->string('tracking')->nullable(); $t->string('carrier')->nullable(); $t->json('lines'); $t->timestamps(); });
  Schema::create('shop_settings', function(Blueprint $t) { $t->string('key')->primary(); $t->json('value'); });
  Schema::create('messages', function(Blueprint $t) { $t->id(); $t->string('email'); $t->string('name'); $t->text('message'); $t->boolean('resolved')->default(false); $t->timestamps(); });
  Schema::create('subscribers', function(Blueprint $t) { $t->id(); $t->string('email')->unique(); $t->timestamps(); });
  Schema::create('audit_events', function(Blueprint $t) { $t->id(); $t->foreignId('user_id')->nullable()->constrained(); $t->string('action'); $t->string('subject'); $t->json('details'); $t->timestamp('created_at')->useCurrent(); });
 }
 public function down(): void { foreach(['audit_events','subscribers','messages','shop_settings','shipments','orders','addresses','products','shops'] as $table) Schema::dropIfExists($table); Schema::table('users',fn(Blueprint $t)=>$t->dropColumn(['role','seller_id','wishlist'])); }
};
