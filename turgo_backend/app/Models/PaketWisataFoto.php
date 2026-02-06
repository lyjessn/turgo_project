<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PaketWisataFoto extends Model
{
    protected $fillable = [
        'paket_wisata_id',
        'url_foto'
    ];

    public function paketWisata()
    {
        return $this->belongsTo(PaketWisata::class);
    }
}
