<?php

use Illuminate\Support\Facades\Schedule;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Log;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Schedule::command('bookings:cancel-expired')
    ->everyMinute();

Schedule::command('booking:auto-complete')
    ->everyMinute();

Schedule::command('reminder:h1')->dailyAt('09:00');

Schedule::call(function () {
    Log::info("CRON HIDUP HOSTING " . now());
})->everyMinute();