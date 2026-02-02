<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BookingCustomDetail extends Model
{
    protected $fillable = [
        'booking_id',
        'jumlah_orang',
        'tour_guide_id',
        'jenis_tour_guide',
    ];

    public $timestamps = true;

    public function booking()
    {
        return $this->belongsTo(Booking::class);
    }

    public function tourGuide()
    {
        return $this->belongsTo(TourGuide::class);
    }
}
