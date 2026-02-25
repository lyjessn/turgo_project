<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Booking;
use Carbon\Carbon;

class UpdateStatus extends Command
{
    protected $signature = 'bookings:update-status';

    protected $description = 'Update bookings to selesai after H+3 tanggal selesai';

    public function handle()
    {
        $count = Booking::where('status_pemesanan', 'dikonfirmasi')
            ->whereDate('tanggal_selesai', '<=', now()->subDays(3))
            ->update([
                'status_pemesanan' => 'selesai'
            ]);

        $this->info("Bookings updated to selesai: {$count}");
    }
}