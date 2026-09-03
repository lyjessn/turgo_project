<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\TourGuide;
use App\Models\PaketWisata;
use App\Models\Homestay;

class BlockoutSpesifik extends Model
{
    protected $fillable = [
        'kategori',
        'id_target',
        'tanggal_mulai',
        'tanggal_selesai',
        'alasan',
    ];

    public function tourGuide()
    {
        return $this->belongsTo(TourGuide::class, 'id_target');
    }

    public function paketWisata()
    {
        return $this->belongsTo(PaketWisata::class, 'id_target');
    }

    public function homestay()
    {
        return $this->belongsTo(Homestay::class, 'id_target');
    }
    
}
