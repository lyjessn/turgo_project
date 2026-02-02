<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BookingTourGuideDetail extends Model
{
    protected $fillable = [
        'booking_id',
        'tour_guide_id',
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
