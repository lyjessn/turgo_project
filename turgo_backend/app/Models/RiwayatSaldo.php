<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RiwayatSaldo extends Model
{
    protected $fillable = [
        'user_id',
        'booking_id',
        'jumlah',
        'tanggal',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function booking()
    {
        return $this->belongsTo(Booking::class);
    }
}
