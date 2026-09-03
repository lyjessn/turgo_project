<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BlockoutGlobal extends Model
{
    protected $fillable = [
        'alasan',
        'tanggal_mulai',
        'tanggal_selesai',
    ];
    
}
