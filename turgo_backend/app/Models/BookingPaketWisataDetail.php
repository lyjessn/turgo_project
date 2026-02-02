<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BookingPaketWisataDetail extends Model
{
    protected $fillable = [
        'booking_id',
        'paket_wisata_id',
        'jumlah_orang',
    ];

    public $timestamps = true;

    public function booking()
    {
        return $this->belongsTo(Booking::class);
    }

    public function paketWisata()
    {
        return $this->belongsTo(PaketWisata::class);
    }
}
