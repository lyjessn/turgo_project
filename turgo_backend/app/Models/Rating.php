<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Rating extends Model
{
    protected $fillable = [
        'user_id',
        'booking_id',
        'tipe_target',
        'id_target',
        'bintang',
        'review',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function booking()
    {
        return $this->belongsTo(Booking::class);
    }
    public function paketWisata()
    {
        return $this->belongsTo(PaketWisata::class, 'id_target')
            ->where('tipe_target', 'paket_wisata');
    }

    public function tourGuide()
    {
        return $this->belongsTo(TourGuide::class, 'id_target')
            ->where('tipe_target', 'tour_guide');
    }

    public function homestay()
    {
        return $this->belongsTo(Homestay::class, 'id_target')
            ->where('tipe_target', 'homestay');
    }
}
