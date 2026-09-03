<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Kamar extends Model
{
    protected $fillable = [
        'homestay_id',
        'nama',
        'harga_per_malam',
        'wifi',
        'jumlah_kasur',
        'deskripsi_kasur',
        'jumlah_toilet',
        'deskripsi_toilet',
        'foto',
        'is_aktif'
    ];

    public function homestay()
    {
        return $this->belongsTo(Homestay::class);
    }
    
}
