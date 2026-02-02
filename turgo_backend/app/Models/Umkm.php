<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Umkm extends Model
{
    protected $fillable = [
        'user_id', 'nama_usaha', 'lokasi', 'nomor_telepon', 'jam_operasional', 'menu_tersedia', 'is_aktif', 'is_buka'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
