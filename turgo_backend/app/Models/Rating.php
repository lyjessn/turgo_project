<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Rating extends Model
{
    protected $fillable = [
        'user_id',
        'id_target',
        'bintang',
        'review',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
