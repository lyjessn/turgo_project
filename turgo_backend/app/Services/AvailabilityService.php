<?php

namespace App\Services;

use App\Models\{
    BookingHomestayDetail,
    BookingTourGuideDetail,
    BookingPaketWisataDetail,
};

class AvailabilityService
{
    public static function isHomestayAvailable(
        int $kamarId,
        string $mulai,
        string $selesai
    ): bool
    {
        return !BookingHomestayDetail::where('kamar_id', $kamarId)
            ->whereHas('booking', function ($q) use ($mulai, $selesai) {

                $q->whereIn('status_pemesanan', [
                        'menunggu pembayaran',
                        'menunggu verifikasi',
                        'dikonfirmasi'
                    ])

                    ->where(function ($q2) {
                        $q2->whereNull('expired_at')
                        ->orWhere('expired_at', '>', now());
                    })

                    ->where(function ($query) use ($mulai, $selesai) {

                        $query->where('tanggal_mulai', '<', $selesai)
                            ->where('tanggal_selesai', '>', $mulai);

                    });
            })
            ->exists();
    }


    public static function checkHomestay(
        int $kamarId,
        string $mulai,
        string $selesai
    ): void
    {
        if (!self::isHomestayAvailable($kamarId, $mulai, $selesai)) {
            abort(422, 'Kamar sudah dibooking pada tanggal tersebut');
        }
    }

    public static function isTourGuideAvailable(
        int $tourGuideId,
        string $tanggal,
        string $durasi,
        ?string $sesi
    ): bool
    {
        $baseQuery = BookingTourGuideDetail::where('tour_guide_id', $tourGuideId)
            ->whereHas('booking', function ($q) use ($tanggal) {
                $q->whereDate('tanggal_mulai', $tanggal)
                ->whereIn('status_pemesanan', [
                    'menunggu pembayaran',
                    'menunggu verifikasi',
                    'dikonfirmasi'
                ])
                ->where(function ($q2) {
                    $q2->whereNull('expired_at')
                        ->orWhere('expired_at', '>', now());
                });
            });

        if ($durasi === 'full day') {
            return !(clone $baseQuery)->exists();
        }

        if ($durasi === 'half day') {

            if ((clone $baseQuery)->where('durasi', 'full day')->exists())
                return false;

            if ((clone $baseQuery)
                ->where('durasi', 'half day')
                ->where('sesi', $sesi)
                ->exists())
                return false;
        }

        return true;
    }

    public static function checkTourGuide(
        int $tourGuideId,
        string $tanggal,
        string $durasi,
        ?string $sesi
    ): void
    {
        if (!self::isTourGuideAvailable( $tourGuideId, $tanggal, $durasi, $sesi)) {
            abort(422, 'Tour guide tidak tersedia');
        }
    }

    public static function isPaketWisataAvailable(
        int $paketId,
        string $tanggal
    ): bool
    {
        $count = BookingPaketWisataDetail::where('paket_wisata_id', $paketId)
            ->whereHas('booking', function ($q) use ($tanggal) {
               $q->whereDate('tanggal_mulai', $tanggal)
                ->whereIn('status_pemesanan', [
                    'menunggu pembayaran',
                    'menunggu verifikasi',
                    'dikonfirmasi'
                ])
                ->where(function ($q2) {
                    $q2->whereNull('expired_at')
                        ->orWhere('expired_at', '>', now());
                });
            })
            ->count();

        return $count < 2;
    }

    public static function checkPaketWisata(
        int $paketId,
        string $tanggal
    ): void
    {
        if (!self::isPaketWisataAvailable($paketId, $tanggal)) {
            abort(422, 'Paket wisata sudah penuh');
        }
    }

}
