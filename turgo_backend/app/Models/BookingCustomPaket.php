<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BookingCustomPaket extends Model
{
    protected $fillable = [
        'booking_custom_id',
        'paket_wisata_id',
    ];

    public $timestamps = true;

    public function bookingCustomDetail()
    {
        return $this->belongsTo(BookingCustomDetail::class, 'booking_custom_id', 'booking_id');
    }

    public function paketWisata()
    {
        return $this->belongsTo(PaketWisata::class);
    }
}
