<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PaketWisata extends Model
{
    protected $fillable = [
        'id_pembuat',
        'nama',
        'kategori_paket',
        'deskripsi',
        'preview',
        'harga',
        'rating',
        'is_aktif',
        'url_thumbnail',
        'durasi',
        'lokasi',
        'perlengkapan',
        'kapasitas_min',
        'kapasitas_max'
    ];

    public function pembuat()
    {
        return $this->belongsTo(User::class, 'id_pembuat');
    }

    public function fotos()
    {
        return $this->hasMany(PaketWisataFoto::class);
    }

    public function participants()
    {
        return $this->belongsToMany(User::class, 'paket_wisata_participants')
                    ->withPivot('persentase')
                    ->withTimestamps();
    }
    public function blockouts()
    {
        return $this->hasMany(BlockoutSpesifik::class, 'id_target', 'id');
    }

    public function bookingDetails()
    {
        return $this->hasMany(  BookingPaketWisataDetail::class,  'paket_wisata_id' );
    }

    public function ratings()
    {
        return $this->hasMany(Rating::class, 'id_target')
            ->where('tipe_target', 'paket_wisata');
    }

    
}
