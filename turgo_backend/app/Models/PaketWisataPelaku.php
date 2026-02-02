<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\Pivot;

class PaketWisataPelaku extends Pivot
{
    protected $table = 'paket_wisata_pelaku';

    protected $fillable = ['paket_wisata_id', 'pelaku_wisata_id', 'persentase'];
}
