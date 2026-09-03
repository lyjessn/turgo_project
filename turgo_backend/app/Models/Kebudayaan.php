<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Kebudayaan extends Model
{
    protected $fillable = [
        'nama',
        'deskripsi',
        'foto',
        'is_aktif',
    ];
    
}
