<?php

use App\Http\Controllers\AccountController as Account;
use App\Http\Controllers\IssueController;
use App\Http\Controllers\ManageController as Manage;
use App\Http\Controllers\OrderController as Order;
use App\Http\Controllers\OtpController;
use App\Http\Controllers\SettlementController;
use App\Http\Controllers\ShopController as Shop;
use Illuminate\Support\Facades\Route;

Route::prefix('api')->group(function () {
    Route::get('/session', [Account::class, 'session']);
    Route::get('/catalog', [Shop::class, 'catalog']);
    Route::middleware('throttle:8,1')->group(function () {
        Route::post('/register', [Account::class, 'register']);
        Route::post('/login', [Account::class, 'login']);
        Route::post('/otp/request', [OtpController::class, 'request'])->block(10, 10);
        Route::post('/otp/verify', [OtpController::class, 'verify'])->block(10, 10);
        Route::post('/forgot-password', [Account::class, 'forgot']);
        Route::post('/reset-password', [Account::class, 'reset']);
        Route::post('/subscribe', [Shop::class, 'subscribe']);
        Route::post('/contact', [Shop::class, 'contact']);
    });
    Route::middleware('auth')->group(function () {
        Route::get('/issues', [IssueController::class, 'index']);
        Route::post('/issues', [IssueController::class, 'store']);
        Route::patch('/issues/{id}', [IssueController::class, 'update']);
        Route::get('/settlements', [SettlementController::class, 'index']);
        Route::post('/settlements/payouts', [SettlementController::class, 'record']);
        Route::post('/logout', [Account::class, 'logout']);
        Route::patch('/profile', [Account::class, 'profile']);
        Route::post('/password', [Account::class, 'password'])->middleware('throttle:5,1');
        Route::post('/wishlist', [Account::class, 'wishlist']);
        Route::get('/addresses', [Account::class, 'addresses']);
        Route::post('/addresses', [Account::class, 'saveAddress']);
        Route::delete('/addresses/{id}', [Account::class, 'deleteAddress']);
        Route::get('/orders', [Order::class, 'index']);
        Route::post('/checkout/quote', [Order::class, 'preview']);
        Route::post('/orders', [Order::class, 'store'])->middleware('throttle:10,1');
        Route::post('/orders/{id}/cancel', [Order::class, 'cancel']);
        Route::get('/seller-application', [Shop::class, 'application']);
        Route::post('/seller-application', [Shop::class, 'apply'])->middleware('throttle:3,1');
        Route::get('/manage', [Manage::class, 'index']);
        Route::post('/manage/products', [Manage::class, 'product']);
        Route::patch('/manage/products/{id}', [Manage::class, 'product']);
        Route::patch('/manage/products/{id}/stock', [Manage::class, 'stock']);
        Route::post('/manage/upload', [Manage::class, 'upload'])->middleware('throttle:20,1');
        Route::patch('/manage/shops/{id}', [Manage::class, 'shop']);
        Route::patch('/manage/shipments/{id}', [Manage::class, 'shipment']);
        Route::patch('/manage/orders/{id}/payment', [Manage::class, 'payment']);
        Route::patch('/manage/settings', [Manage::class, 'settings']);
        Route::patch('/manage/messages/{id}', [Manage::class, 'message']);
    });
});
