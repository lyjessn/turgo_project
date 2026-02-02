<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PaketWisata extends Model
{
    protected $fillable = [
        'nama', 'deskripsi', 'preview', 'harga', 'rating', 'is_aktif', 'url_thumbnail', 'durasi', 'lokasi', 'perlengkapan', 'kapasitas_min', 'kapasitas_max'
    ];

    public function fotos()
    {
        return $this->hasMany(PaketWisataFoto::class);
    }

    public function pelakuWisatas()
    {
        return $this->belongsToMany(PelakuWisata::class, 'paket_wisata_pelaku')
                    ->withPivot('persentase')
                    ->withTimestamps();
    }
}
