<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UmkmFoto extends Model
{
    protected $table = 'umkm_fotos';

    protected $fillable = [
        'umkm_id',
        'url_foto'
    ];

    public function umkm()
    {
        return $this->belongsTo(Umkm::class);
    }
}
