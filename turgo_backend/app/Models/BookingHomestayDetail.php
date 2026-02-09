<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BookingHomestayDetail extends Model
{
    protected $fillable = [
        'booking_id',
        'homestay_id',
        'kamar_id',
    ];

    protected $primaryKey = 'booking_id';
    public $incrementing = false;

    public $timestamps = true;

    public function booking()
    {
        return $this->belongsTo(Booking::class);
    }

    public function homestay()
    {
        return $this->belongsTo(Homestay::class);
    }

    public function kamar()
    {
        return $this->belongsTo(Kamar::class);
    }
}
