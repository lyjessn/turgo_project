<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use Notifiable;

    protected $table = 'user'; // karena tabel kamu namanya user, bukan users

    protected $fillable = [
        'username', 'email', 'password', 'nama_lengkap', 'nomor_telepon', 'role_id', 'foto_profil', 'is_aktif'
    ];

    protected $hidden = ['password'];

    public function role()
    {
        return $this->belongsTo(Role::class);
    }

    public function tourGuide()
    {
        return $this->hasOne(TourGuide::class);
    }

    public function pelakuWisata()
    {
        return $this->hasOne(PelakuWisata::class);
    }

    public function umkm()
    {
        return $this->hasOne(Umkm::class);
    }

    public function homestays()
    {
        return $this->hasOne(Homestay::class, 'id_pemilik');
    }
}
