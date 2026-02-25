<?php

namespace App\Services;

use App\Models\BlockoutGlobal;
use App\Models\BlockoutSpesifik;

class BlockoutService
{
    public static function isBlocked(
        string $kategori,
        ?int $idTarget,
        string $mulai,
        string $selesai
    ): bool {
        if (self::isGlobalBlocked($mulai, $selesai)) {
            return true;
        }

        if ($kategori !== 'global' && $idTarget !== null) {
            return self::isSpesifikBlocked(
                $kategori,
                $idTarget,
                $mulai,
                $selesai
            );
        }

        return false;
    }

    public static function isGlobalBlocked(
        string $mulai,
        string $selesai
    ): bool {
        return BlockoutGlobal::where(function ($q) use ($mulai, $selesai) {
            $q->whereBetween('tanggal_mulai', [$mulai, $selesai])
              ->orWhereBetween('tanggal_selesai', [$mulai, $selesai])
              ->orWhere(function ($q2) use ($mulai, $selesai) {
                  $q2->where('tanggal_mulai', '<=', $mulai)
                     ->where('tanggal_selesai', '>=', $selesai);
              });
        })->exists();
    }

    public static function isSpesifikBlocked(
        string $kategori,
        int $idTarget,
        string $mulai,
        string $selesai
    ): bool {
        return BlockoutSpesifik::where('kategori', $kategori)
            ->where('id_target', $idTarget)
            ->where(function ($q) use ($mulai, $selesai) {
                $q->whereBetween('tanggal_mulai', [$mulai, $selesai])
                  ->orWhereBetween('tanggal_selesai', [$mulai, $selesai])
                  ->orWhere(function ($q2) use ($mulai, $selesai) {
                      $q2->where('tanggal_mulai', '<=', $mulai)
                         ->where('tanggal_selesai', '>=', $selesai);
                  });
            })
            ->exists();
    }

    public static function getBlockedIds(
        string $kategori,
        string $tanggal
    ){
        return BlockoutSpesifik::where('kategori', $kategori)
            ->whereDate('tanggal_mulai', '<=', $tanggal)
            ->whereDate('tanggal_selesai', '>=', $tanggal)
            ->pluck('id_target');
    }



}

