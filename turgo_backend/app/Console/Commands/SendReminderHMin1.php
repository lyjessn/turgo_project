<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Http\Controllers\BookingController;

class SendReminderHMin1 extends Command
{
    protected $signature = 'reminder:h1';
    protected $description = 'Send reminder email H-1 kegiatan';

    public function handle()
    {
        app(BookingController::class)->sendReminderH1();

        $this->info('Reminder H-1 sent successfully');
    }
}