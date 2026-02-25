<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Booking;

class CancelExpiredBookings extends Command
{
    protected $signature = 'bookings:cancel-expired';

    protected $description = 'Cancel expired bookings';

    public function handle()
    {
        $count = Booking::where('status_pemesanan', 'menunggu pembayaran')
            ->whereNotNull('expired_at')
            ->where('expired_at', '<', now())
            ->update([
                'status_pemesanan' => 'batal'
            ]);

        $this->info("Expired bookings cancelled: {$count}");
    }
}
