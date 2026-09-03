<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TourGuide extends Model
{
    protected $fillable = [
        'user_id',
        'bio',
        'harga_per_hari',
        'foto_profil',
        'is_aktif',
        'bahasa',
        'spesialisasi',
        'kapasitas_min',
        'kapasitas_max'
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function bookingDetails()
    {
        return $this->hasMany(BookingTourGuideDetail::class, 'tour_guide_id');
    }

    public function ratings()
    {
        return $this->hasMany(Rating::class, 'id_target')
            ->where('tipe_target', 'tour_guide');
    }

    
}
