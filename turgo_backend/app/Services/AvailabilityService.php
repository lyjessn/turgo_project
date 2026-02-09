<?php

namespace App\Services;

use App\Models\{
    BookingHomestayDetail,
    BookingTourGuideDetail,
    BookingCustomDetail,
    PaketWisata
};

class AvailabilityService
{
    public static function checkHomestay(
        int $kamarId,
        string $mulai,
        string $selesai
    ): void
    {
        $isBooked = BookingHomestayDetail::where('kamar_id', $kamarId)
            ->whereHas('booking', function ($q) use ($mulai, $selesai) {
                $q->whereNotIn('status_pemesanan', ['batal', 'ditolak'])
                  ->where(function ($query) use ($mulai, $selesai) {
                      $query
                          ->whereBetween('tanggal_mulai', [$mulai, $selesai])
                          ->orWhereBetween('tanggal_selesai', [$mulai, $selesai])
                          ->orWhere(function ($q2) use ($mulai, $selesai) {
                              $q2->where('tanggal_mulai', '<=', $mulai)
                                 ->where('tanggal_selesai', '>=', $selesai);
                          });
                  });
            })
            ->exists();

        if ($isBooked) {
            abort(422, 'Kamar sudah dibooking pada tanggal tersebut');
        }
    }

    public static function checkTourGuide(
        int $tourGuideId,
        string $tanggal,
        string $durasi,
        ?string $sesi
    ): void
    {
        $baseQuery = BookingTourGuideDetail::where('tour_guide_id', $tourGuideId)
            ->whereHas('booking', function ($q) use ($tanggal) {
                $q->whereDate('tanggal_mulai', $tanggal)
                ->whereNotIn('status_pemesanan', ['batal', 'ditolak']);
            });

        if ($durasi === 'full day') {

            $hasAnyBooking = (clone $baseQuery)->exists();

            if ($hasAnyBooking) {
                abort(
                    422,
                    'Tour guide sudah dibooking (half day atau full day) di tanggal tersebut'
                );
            }
        }

        if ($durasi === 'half day') {

            $hasFullDay = (clone $baseQuery)
                ->where('durasi', 'full day')
                ->exists();

            if ($hasFullDay) {
                abort(422, 'Tour guide sudah dibooking full day');
            }

            $hasSameSession = (clone $baseQuery)
                ->where('durasi', 'half day')
                ->where('sesi', $sesi)
                ->exists();

            if ($hasSameSession) {
                abort(422, "Sesi {$sesi} sudah dibooking");
            }
        }
    }

    public static function checkPaketWisata(
        int $paketId,
        string $tanggal
    ): void
    {
        $count = BookingCustomDetail::where('paket_wisata_id', $paketId)
            ->whereHas('booking', function ($q) use ($tanggal) {
                $q->whereDate('tanggal_mulai', $tanggal)
                  ->whereNotIn('status_pemesanan', ['batal', 'ditolak']);
            })
            ->count();

        if ($count >= 2) {
            $nama = PaketWisata::find($paketId)?->nama ?? 'Paket';
            abort(422, "{$nama} sudah penuh di tanggal tersebut");
        }
    }
}
