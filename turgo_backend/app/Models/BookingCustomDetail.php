<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BookingCustomDetail extends Model
{
    protected $fillable = [
        'booking_id',
        'paket_wisata_id',
        'jumlah_orang',
        'tour_guide_id',
        'jenis_tour_guide',
    ];

    protected $primaryKey = 'booking_id';
    public $incrementing = false;

    public $timestamps = true;

    public function booking()
    {
        return $this->belongsTo(Booking::class);
    }

    public function paketWisata()
    {
        return $this->belongsTo(PaketWisata::class);
    }

    public function tourGuide()
    {
        return $this->belongsTo(TourGuide::class, 'tour_guide_id');
    }
}
