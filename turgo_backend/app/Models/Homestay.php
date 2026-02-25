<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Homestay extends Model
{
    protected $fillable = [
        'nama',
        'id_pemilik',
        'lokasi',
        'rating',
        'is_aktif',
        'url_thumbnail',
        'check_in',
        'check_out',
        'rokok',
        'peliharaan'
    ];

    public function pemilik()
    {
        return $this->belongsTo(User::class, 'id_pemilik');
    }

    public function fotos()
    {
        return $this->hasMany(HomestayFoto::class);
    }

    public function kamars()
    {
        return $this->hasMany(Kamar::class);
    }

    public function bookingDetails()
    {
        return $this->hasMany(BookingHomestayDetail::class, 'homestay_id');
    }

    public function ratings()
    {
        return $this->hasMany(Rating::class, 'id_target')
            ->where('tipe_target', 'homestay');
    }

}
