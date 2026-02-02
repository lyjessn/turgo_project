<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class HomestayFoto extends Model
{
    protected $fillable = ['homestay_id', 'url_foto'];

    public function homestay()
    {
        return $this->belongsTo(Homestay::class);
    }
}
