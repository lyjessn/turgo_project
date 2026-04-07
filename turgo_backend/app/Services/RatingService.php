<?php

namespace App\Services;
use Illuminate\Support\Facades\Auth;

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

    public static function summary(string $tipeTarget,int $idTarget):array
    {
        $query=Rating::where('tipe_target',$tipeTarget)
            ->where('id_target',$idTarget);

        return[
            'average'=>round((float)$query->avg('bintang'),1),
            'total'=>$query->count(),
        ];
    }


    public static function getRateableItems(Booking $booking):array
    {
        $items=[];
        $userId = Auth::id();

        if (!$userId) return [];

        $pakets=BookingPaketWisataDetail::where('booking_id',$booking->id)
            ->with('paketWisata')
            ->get();

        foreach($pakets as $p)
        {
            if(!$p->paketWisata) continue;

            $items[]=[
                'tipe_target'=>'paket_wisata',
                'id_target'=>$p->paket_wisata_id,
                'nama'=>$p->paketWisata->nama,
                'thumbnail'=>$p->paketWisata->url_thumbnail,
                'sudah_rating'=>self::exists(
                    $userId,
                    $booking->id,
                    'paket_wisata',
                    $p->paket_wisata_id
                )
            ];
        }

        $customs=BookingCustomDetail::where('booking_id',$booking->id)
            ->with(['paketWisata','tourGuide.user'])
            ->get();

        $addedTourGuide=false;

        foreach($customs as $c)
        {
            if($c->paketWisata)
            {
                $items[]=[
                    'tipe_target'=>'paket_wisata',
                    'id_target'=>$c->paket_wisata_id,
                    'nama'=>$c->paketWisata->nama,
                    'thumbnail'=>$c->paketWisata->url_thumbnail,
                    'sudah_rating'=>self::exists(
                        $userId,
                        $booking->id,
                        'paket_wisata',
                        $c->paket_wisata_id
                    )
                ];
            }

            if($c->tourGuide && !$addedTourGuide)
            {
                $items[]=[
                    'tipe_target'=>'tour_guide',
                    'id_target'=>$c->tour_guide_id,
                    'nama'=>$c->tourGuide->user->nama_lengkap,
                    'thumbnail'=>$c->tourGuide->foto_profil,
                    'sudah_rating'=>self::exists(
                        $userId,
                        $booking->id,
                        'tour_guide',
                        $c->tour_guide_id
                    )
                ];

                $addedTourGuide=true;
            }
        }

        $tgs=BookingTourGuideDetail::where('booking_id',$booking->id)
            ->with('tourGuide.user')
            ->get();

        foreach($tgs as $tg)
        {
            if(!$tg->tourGuide) continue;

            $items[]=[
                'tipe_target'=>'tour_guide',
                'id_target'=>$tg->tour_guide_id,
                'nama'=>$tg->tourGuide->user->nama_lengkap,
                'thumbnail'=>$tg->tourGuide->foto_profil,
                'sudah_rating'=>self::exists(
                    $userId,
                    $booking->id,
                    'tour_guide',
                    $tg->tour_guide_id
                )
            ];
        }

        $hs=BookingHomestayDetail::where('booking_id',$booking->id)
            ->with('homestay')
            ->first();

        if($hs && $hs->homestay)
        {
            $items[]=[
                'tipe_target'=>'homestay',
                'id_target'=>$hs->homestay_id,
                'nama'=>$hs->homestay->nama,
                'thumbnail'=>$hs->homestay->url_thumbnail,
                'sudah_rating'=>self::exists(
                    $userId,
                    $booking->id,
                    'homestay',
                    $hs->homestay_id
                )
            ];
        }

        return collect($items)
            ->unique(fn($i)=>$i['tipe_target'].'-'.$i['id_target'])
            ->values()
            ->toArray();
    }



    private static function exists(
        int $userId,
        int $bookingId,
        string $tipeTarget,
        int $idTarget
    ): bool {
        return Rating::where([
            'user_id' => $userId,
            'booking_id' => $bookingId,
            'tipe_target' => $tipeTarget,
            'id_target' => $idTarget
        ])->exists();
    }



    public static function store(
        int $userId,
        int $bookingId,
        string $tipeTarget,
        int $idTarget,
        int $bintang,
        ?string $review
    ):Rating
    {
        $exists=Rating::where([
            'user_id'=>$userId,
            'booking_id'=>$bookingId,
            'tipe_target'=>$tipeTarget,
            'id_target'=>$idTarget
        ])->exists();

        if($exists)
        {
            abort(422,'Kamu sudah memberi rating untuk item ini');
        }

        return Rating::create([
            'user_id'=>$userId,
            'booking_id'=>$bookingId,
            'tipe_target'=>$tipeTarget,
            'id_target'=>$idTarget,
            'bintang'=>$bintang,
            'review'=>$review,
        ]);
    }

    public static function bookingSudahRatingSemua(Booking $booking): bool
    {
        $items = self::getRateableItems($booking);

        foreach ($items as $item)
        {
            if (!$item['sudah_rating']) {
                return false;
            }
        }

        return true;
    }

}