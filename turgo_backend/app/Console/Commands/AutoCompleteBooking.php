<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use App\Models\Booking;
use App\Models\RiwayatSaldo;

class AutoCompleteBooking extends Command
{
    protected $signature = 'booking:auto-complete';
    protected $description = 'Auto complete / reject booking setelah tanggal layanan lewat';

    public function handle()
    {
        $today = now()->startOfDay();

        $this->info("=== AUTO COMPLETE BOOKING START ===");

        // reject booking yang tidak diverifikasi
        $rejected = Booking::where('status_pemesanan', 'menunggu verifikasi')
            ->whereDate('tanggal_selesai', '<', $today)
            ->update([
                'status_pemesanan' => 'ditolak'
            ]);

        $this->info("Booking ditolak otomatis: ".$rejected);

        // ambil booking yang sudah lewat tanggal layanan
        $bookings = Booking::with([
            'homestayDetails.homestay',
            'tourGuideDetails.tourGuide',
            'paketWisataDetails.paketWisata.participants',
            'customDetails.paketWisata.participants'
        ])
        ->whereDate('tanggal_selesai','<', $today)
        ->whereNotIn('status_pemesanan',['batal','ditolak'])
        ->get();

        $this->info("Total booking diproses: ".$bookings->count());

        foreach ($bookings as $booking) {

            $this->info("Processing booking ID: ".$booking->id." | tipe: ".$booking->tipe_booking);

            // ubah status menjadi selesai
            DB::table('bookings')
                ->where('id', $booking->id)
                ->update([
                    'status_pemesanan' => 'selesai'
                ]);

            /*
            |--------------------------------------------------------------------------
            | HOMESTAY
            |--------------------------------------------------------------------------
            */

            if ($booking->tipe_booking === 'homestay') {

                $ownerId = optional($booking->homestayDetails?->homestay)->id_pemilik;

                $this->info("Homestay owner: ".$ownerId);

                $this->insertSaldoIfNotExists(
                    $booking->id,
                    $ownerId,
                    $booking->total_harga
                );
            }

            /*
            |--------------------------------------------------------------------------
            | TOUR GUIDE
            |--------------------------------------------------------------------------
            */

            if ($booking->tipe_booking === 'tour_guide') {

                $tgUserId = optional($booking->tourGuideDetails?->tourGuide)->user_id;

                $this->info("Tour guide user: ".$tgUserId);

                $this->insertSaldoIfNotExists(
                    $booking->id,
                    $tgUserId,
                    $booking->total_harga
                );
            }

            /*
            |--------------------------------------------------------------------------
            | PAKET WISATA
            |--------------------------------------------------------------------------
            */

            if ($booking->tipe_booking === 'paket_wisata') {

                $paket = $booking->paketWisataDetails?->paketWisata;

                if (!$paket) {
                    $this->warn("Paket wisata tidak ditemukan untuk booking ".$booking->id);
                    continue;
                }

                $participants = $paket->participants;

                if ($participants && $participants->count() > 0) {

                    $this->info("Participants ditemukan: ".$participants->count());

                    foreach ($participants as $p) {

                        $jumlah = ($booking->total_harga * $p->pivot->persentase) / 100;

                        $this->info("Insert saldo participant ".$p->id." jumlah ".$jumlah);

                        $this->insertSaldoIfNotExists(
                            $booking->id,
                            $p->id,
                            $jumlah
                        );
                    }

                } else {

                    $this->warn("Participants kosong → fallback ke pembuat paket");

                    $this->insertSaldoIfNotExists(
                        $booking->id,
                        $paket->id_pembuat,
                        $booking->total_harga
                    );
                }
            }

            /*
            |--------------------------------------------------------------------------
            | CUSTOM PACKAGE
            |--------------------------------------------------------------------------
            */

            if ($booking->tipe_booking === 'custom') {

                foreach ($booking->customDetails ?? [] as $detail) {

                    $paket = $detail->paketWisata;

                    if (!$paket) {
                        $this->warn("Custom paket tidak ditemukan");
                        continue;
                    }

                    $participants = $paket->participants;

                    if ($participants && $participants->count() > 0) {

                        foreach ($participants as $p) {

                            $jumlah = ($booking->total_harga * $p->pivot->persentase) / 100;

                            $this->info("Insert saldo custom participant ".$p->id." jumlah ".$jumlah);

                            $this->insertSaldoIfNotExists(
                                $booking->id,
                                $p->id,
                                $jumlah
                            );
                        }

                    } else {

                        $this->warn("Custom participants kosong → fallback pembuat");

                        $this->insertSaldoIfNotExists(
                            $booking->id,
                            $paket->id_pembuat,
                            $booking->total_harga
                        );
                    }
                }
            }

        }

        $this->info("=== AUTO COMPLETE BOOKING END ===");
    }


    /*
    |--------------------------------------------------------------------------
    | Insert saldo helper
    |--------------------------------------------------------------------------
    */

    private function insertSaldoIfNotExists($bookingId, $userId, $jumlah)
    {
        if (!$userId) {
            $this->warn("User ID kosong untuk booking ".$bookingId);
            return;
        }

        $exists = RiwayatSaldo::where('booking_id', $bookingId)
            ->where('user_id', $userId)
            ->exists();

        if (!$exists) {

            RiwayatSaldo::create([
                'user_id' => $userId,
                'booking_id' => $bookingId,
                'jumlah' => $jumlah,
                'tanggal' => now()
            ]);

            $this->info("Saldo inserted → user ".$userId." booking ".$bookingId);

        } else {

            $this->warn("Saldo sudah ada → user ".$userId." booking ".$bookingId);

        }
    }
}