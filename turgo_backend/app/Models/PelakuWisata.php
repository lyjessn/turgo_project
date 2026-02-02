<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PelakuWisata extends Model
{
    protected $fillable = [
        'user_id', 'nama_usaha', 'deskripsi', 'alamat', 'nomor_telepon', 'foto_profil', 'is_aktif'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
