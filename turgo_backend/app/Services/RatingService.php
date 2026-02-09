<?php

namespace App\Services;

use App\Models\{
    Rating,
    Booking,
    BookingPaketWisataDetail,
    BookingCustomDetail,
    BookingTourGuideDetail,
    BookingHomestayDetail
};

class RatingService
{
    public static function summary(string $tipeTarget, int $idTarget): array
    {
        $query = Rating::where('tipe_target', $tipeTarget)
            ->where('id_target', $idTarget);

        return [
            'average' => round((float) $query->avg('bintang'), 1),
            'total'   => $query->count(),
        ];
    }

    public static function getRateableItems(Booking $booking): array
    {
        $items = [];

        $pakets = BookingPaketWisataDetail::where('booking_id', $booking->id)
            ->with('paketWisata')
            ->get();

        foreach ($pakets as $p) {
            $items[] = [
                'tipe_target' => 'paket_wisata',
                'id_target'   => $p->paket_wisata_id,
                'nama'        => $p->paketWisata->nama ?? 'Paket Wisata',
            ];
        }

        $customs = BookingCustomDetail::where('booking_id', $booking->id)
            ->with(['paketWisata', 'tourGuide'])
            ->get();

        foreach ($customs as $c) {
            if ($c->paket_wisata_id) {
                $items[] = [
                    'tipe_target' => 'paket_wisata',
                    'id_target'   => $c->paket_wisata_id,
                    'nama'        => $c->paketWisata->nama ?? 'Paket Wisata',
                ];
            }

            if ($c->tour_guide_id) {
                $items[] = [
                    'tipe_target' => 'tour_guide',
                    'id_target'   => $c->tour_guide_id,
                    'nama'        => $c->tourGuide->nama ?? 'Tour Guide',
                ];
            }
        }

        $tgs = BookingTourGuideDetail::where('booking_id', $booking->id)
            ->with('tourGuide')
            ->get();

        foreach ($tgs as $tg) {
            $items[] = [
                'tipe_target' => 'tour_guide',
                'id_target'   => $tg->tour_guide_id,
                'nama'        => $tg->tourGuide->nama ?? 'Tour Guide',
            ];
        }

        $hs = BookingHomestayDetail::where('booking_id', $booking->id)
            ->with('homestay')
            ->first();

        if ($hs) {
            $items[] = [
                'tipe_target' => 'homestay',
                'id_target'   => $hs->homestay_id,
                'nama'        => $hs->homestay->nama ?? 'Homestay',
            ];
        }

        return collect($items)->unique(fn ($i) =>
            $i['tipe_target'] . '-' . $i['id_target']
        )->values()->toArray();
    }

    public static function store(
        int $userId,
        int $bookingId,
        string $tipeTarget,
        int $idTarget,
        int $bintang,
        ?string $review
    ): Rating {
        $exists = Rating::where([
            'user_id'     => $userId,
            'booking_id'  => $bookingId,
            'tipe_target' => $tipeTarget,
            'id_target'   => $idTarget,
        ])->exists();

        if ($exists) {
            abort(422, 'Kamu sudah memberi rating untuk item ini');
        }

        return Rating::create([
            'user_id'     => $userId,
            'booking_id'  => $bookingId,
            'tipe_target' => $tipeTarget,
            'id_target'   => $idTarget,
            'bintang'     => $bintang,
            'review'      => $review,
        ]);
    }

}
