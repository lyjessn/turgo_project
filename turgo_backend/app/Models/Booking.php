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
        'expired_at'
    ];

    protected $appends = ['thumbnail'];

   public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function paketWisataDetails()
    {
        return $this->hasOne(BookingPaketWisataDetail::class, 'booking_id');
    }

    public function tourGuideDetails()
    {
        return $this->hasOne(BookingTourGuideDetail::class, 'booking_id');
    }

    public function homestayDetails()
    {
        return $this->hasOne(BookingHomestayDetail::class, 'booking_id');
    }

    public function customDetails()
    {
        return $this->hasMany(BookingCustomDetail::class, 'booking_id');
    }
    
    public function ratings()
    {
        return $this->hasMany(Rating::class);
    }

    public function scopeActive($query)
    {
        return $query
            ->whereIn('status_pemesanan', [
                'menunggu pembayaran',
                'menunggu verifikasi',
                'dikonfirmasi'
            ])
            ->where(function ($q) {
                $q->whereNull('expired_at')
                ->orWhere('expired_at', '>', now());
            });
    }

    public function getThumbnailAttribute()
    {
        if ($this->tipe_booking === 'paket_wisata') {

            return $this->paketWisataDetails
                ?->paketWisata
                ?->url_thumbnail;
        }

        if ($this->tipe_booking === 'custom') {

            return $this->customDetails
                ->first()
                ?->paketWisata
                ?->url_thumbnail;
        }

        if ($this->tipe_booking === 'homestay') {

            return $this->homestayDetails
                ?->homestay
                ?->url_thumbnail;
        }

        if ($this->tipe_booking === 'tour_guide') {

            return $this->tourGuideDetails
                ?->tourGuide
                ?->foto_profil;
        }

        return null;
    }

}
