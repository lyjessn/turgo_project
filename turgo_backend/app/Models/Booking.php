<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Booking extends Model
{
    protected $fillable = [
        'user_id',
        'tipe_booking',
        'tanggal_booking',
        'tanggal_mulai',
        'tanggal_selesai',
        'status_pemesanan',
        'total_harga',
        'bukti_pembayaran',
        'norek_refund',
        'bank_refund',
        'nama_rekening_refund',
    ];

   public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function paketWisataDetails()
    {
        return $this->hasMany(BookingPaketWisataDetail::class, 'booking_id');
    }

    public function tourGuideDetails()
    {
        return $this->hasMany(BookingTourGuideDetail::class, 'booking_id');
    }

    public function homestayDetails()
    {
        return $this->hasMany(BookingHomestayDetail::class, 'booking_id');
    }

    public function customDetails()
    {
        return $this->hasOne(BookingCustomDetail::class, 'booking_id');
    }
    
    public function ratings()
    {
        return $this->hasMany(Rating::class);
    }

}
