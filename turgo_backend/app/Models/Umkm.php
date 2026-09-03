<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Umkm extends Model
{
    protected $fillable = [
        'user_id',
        'nama_usaha',
        'lokasi',
        'nomor_telepon',
        'jam_operasional',
        'menu_tersedia',
        'url_thumbnail',
        'is_aktif',
        'is_buka'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function fotos()
    {
        return $this->hasMany(UmkmFoto::class);
    }
    
}
