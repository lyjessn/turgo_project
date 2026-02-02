<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BlockoutSpesifik extends Model
{
    protected $fillable = [
        'kategori',
        'id_target',
        'tanggal_mulai',
        'tanggal_selesai',
        'alasan',
    ];

}
