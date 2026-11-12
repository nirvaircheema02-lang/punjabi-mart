<?php

use App\Models\User;
use Illuminate\Support\Facades\Artisan;

Artisan::command('shop:admin {email}', function () {
    $user = User::where('email', $this->argument('email'))->first();
    if (! $user) {
        $this->error('Register an account first, then run this command.');

        return 1;
    }
    $user->role = 'admin';
    $user->seller_id = null;
    $user->save();
    $this->info('Admin access granted.');
})->purpose('Grant administrator access to an existing account');
