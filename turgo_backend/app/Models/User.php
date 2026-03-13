<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $table = 'user';

    protected $fillable = [
        'username',
        'email',
        'password',
        'nama_lengkap',
        'nomor_telepon',
        'role_id',
        'foto_profil',
        'is_aktif',
        'profile_completed'
    ];

    protected $hidden = ['password'];

    public function role()
    {
        return $this->belongsTo(Role::class);
    }

    public function tourGuide()
    {
        return $this->hasOne(TourGuide::class, 'user_id');
    }

    public function pelakuWisata()
    {
        return $this->hasOne(PelakuWisata::class);
    }

    public function umkm()
    {
        return $this->hasOne(Umkm::class);
    }

        public function paketWisatas()
    {
        return $this->belongsToMany(PaketWisata::class, 'paket_wisata_participants')
                    ->withPivot('persentase')
                    ->withTimestamps();
    }

    public function homestays()
    {
        return $this->hasOne(Homestay::class, 'id_pemilik');
    }
}
