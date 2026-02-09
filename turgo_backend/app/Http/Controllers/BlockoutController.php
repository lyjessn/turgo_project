<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use App\Models\BlockoutGlobal;
use App\Models\BlockoutSpesifik;
use App\Models\PaketWisata;
class BlockoutController extends Controller
{
    public function indexGlobal(Request $request)
    {
        if (!in_array($request->user()->role->name, ['admin','owner'])) {
            abort(403);
        }

        return BlockoutGlobal::orderBy('tanggal_mulai')->get();
    }

    public function indexSpesifik(Request $request)
    {
        $user = $request->user();
        $query = BlockoutSpesifik::query();

        if (in_array($user->role->name, ['admin','owner'])) {
            return $query->orderBy('tanggal_mulai')->get();
        }

        switch ($user->role->name) {
            case 'tour_guide':
                $query->where('kategori', 'tour_guide')
                    ->where('id_target', $user->tourGuide->id);
                break;

            case 'homestay':
                $query->where('kategori', 'homestay')
                    ->where('id_target', $user->homestay->id);
                break;

            case 'pelaku_wisata':
                $query->where('kategori', 'paket_wisata')
                    ->whereIn('id_target', function ($q) use ($user) {
                        $q->select('paket_wisata_id')
                            ->from('paket_participants')
                            ->where('user_id', $user->id);
                    });
                break;
        }

        return $query->orderBy('tanggal_mulai')->get();
    }

    public function storeGlobal(Request $request)
    {
        if (!in_array($request->user()->role->name, ['admin', 'owner'])) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $request->validate([
            'tanggal_mulai'   => 'required|date',
            'tanggal_selesai' => 'required|date|after_or_equal:tanggal_mulai',
            'alasan'          => 'required|string|max:255',
        ]);

        $blockout = BlockoutGlobal::create([
            'tanggal_mulai'   => $request->tanggal_mulai,
            'tanggal_selesai' => $request->tanggal_selesai,
            'alasan'          => $request->alasan,
        ]);

        return response()->json([
            'success' => true,
            'data' => $blockout
        ], 201);
    }

    public function storeSpesifik(Request $request)
    {
        $user = $request->user();

        $request->validate([
            'kategori'        => 'required|in:paket_wisata,tour_guide,homestay',
            'id_target'       => 'required|integer',
            'tanggal_mulai'   => 'required|date',
            'tanggal_selesai' => 'required|date|after_or_equal:tanggal_mulai',
            'alasan'          => 'required|string|max:255',
        ]);

        switch ($request->kategori) {

            case 'tour_guide':
                if ($user->role->name === 'tour_guide') {
                    if ($user->tourGuide->id != $request->id_target) {
                        return response()->json(['message' => 'Forbidden'], 403);
                    }
                }
                break;

            case 'homestay':
                if ($user->role->name === 'homestay') {
                    if ($user->homestay->id != $request->id_target) {
                        return response()->json(['message' => 'Forbidden'], 403);
                    }
                }
                break;

            case 'paket_wisata':
                if ($user->role->name === 'pelaku_wisata') {
                    $allowed = PaketWisata::where('id', $request->id_target)
                        ->whereHas('participants', function ($q) use ($user) {
                            $q->where('user_id', $user->id);
                        })
                        ->exists();

                    if (!$allowed) {
                        return response()->json(['message' => 'Forbidden'], 403);
                    }
                }
                break;
        }

        $blockout = BlockoutSpesifik::create([
            'kategori'        => $request->kategori,
            'id_target'       => $request->id_target,
            'tanggal_mulai'   => $request->tanggal_mulai,
            'tanggal_selesai' => $request->tanggal_selesai,
            'alasan'          => $request->alasan,
        ]);

        return response()->json([
            'success' => true,
            'data' => $blockout
        ], 201);
    }

    public function updateGlobal(Request $request, $id)
    {
        if (!in_array($request->user()->role->name, ['admin','owner'])) {
            abort(403);
        }

        $request->validate([
            'tanggal_mulai'   => 'required|date',
            'tanggal_selesai' => 'required|date|after_or_equal:tanggal_mulai',
            'alasan'          => 'required|string|max:255',
        ]);

        $blockout = BlockoutGlobal::findOrFail($id);

        $blockout->update($request->only([
            'tanggal_mulai',
            'tanggal_selesai',
            'alasan'
        ]));

        return ['success' => true, 'data' => $blockout];
    }

    public function updateSpesifik(Request $request, $id)
    {
        $blockout = BlockoutSpesifik::findOrFail($id);
        $user = $request->user();

        if (!$this->canAccessSpesifik($user, $blockout)) {
            abort(403);
        }

        $request->validate([
            'tanggal_mulai'   => 'required|date',
            'tanggal_selesai' => 'required|date|after_or_equal:tanggal_mulai',
            'alasan'          => 'required|string|max:255',
        ]);

        $blockout->update($request->only([
            'tanggal_mulai',
            'tanggal_selesai',
            'alasan'
        ]));

        return ['success' => true, 'data' => $blockout];
    }

    public function destroyGlobal(Request $request, $id)
    {
        if (!in_array($request->user()->role->name, ['admin','owner'])) {
            abort(403);
        }

        BlockoutGlobal::findOrFail($id)->delete();

        return ['success' => true];
    }

    public function destroySpesifik(Request $request, $id)
    {
        $blockout = BlockoutSpesifik::findOrFail($id);
        $user = $request->user();

        if (!$this->canAccessSpesifik($user, $blockout)) {
            abort(403);
        }

        $blockout->delete();

        return ['success' => true];
    }


    // ATUR AKSES
    private function canAccessSpesifik($user, $blockout): bool
    {
        if (in_array($user->role->name, ['admin','owner'])) {
            return true;
        }

        if ($user->role->name === 'tour_guide') {
            return $blockout->kategori === 'tour_guide'
                && $blockout->id_target === $user->tourGuide->id;
        }

        if ($user->role->name === 'homestay') {
            return $blockout->kategori === 'homestay'
                && $blockout->id_target === $user->homestay->id;
        }

        if ($user->role->name === 'pelaku_wisata') {
            return $blockout->kategori === 'paket_wisata'
                && PaketWisata::where('id', $blockout->id_target)
                    ->whereHas('participants', fn ($q) =>
                        $q->where('user_id', $user->id)
                    )->exists();
        }

        return false;
    }

}

