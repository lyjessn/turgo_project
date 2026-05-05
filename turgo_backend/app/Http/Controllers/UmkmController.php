<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;
use App\Services\BlockoutService;

use App\Models\Umkm;
use App\Models\UmkmFoto;
use App\Models\User;

class UmkmController extends Controller
{
    public function index(Request $request)
    {
        $query = Umkm::with(['user','fotos']);

        $user = $request->user();

        if (!$user || !in_array($user->role->name, ['admin','owner'])) {
            $query->where('is_aktif', 1);
        }

        if ($request->has('is_aktif')) {
            $query->where('is_aktif', $request->is_aktif);
        }

        if ($request->has('search')) {
            $query->where('nama_usaha', 'like', '%' . $request->search . '%');
        }

        $data = $query
            ->orderBy('id', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $data
        ]);
    }

    public function getUsersUmkm(Request $request)
    {
        $user = $request->user();

        if (!in_array($user->role->name, ['admin','owner'])) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $users = User::where('role_id', 6)
            ->whereDoesntHave('umkm') 
            ->select('id','nama_lengkap','email')
            ->orderBy('nama_lengkap')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $users
        ]);
    }
    
    public function show(Request $request, $id)
    {
        $user = $request->user();

        if (!in_array($user->role->name, ['admin','owner'])) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $umkm = Umkm::with(['user','fotos'])->find($id);

        if (!$umkm) {
            return response()->json(['message' => 'UMKM tidak ditemukan'], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $umkm
        ]);
    }

    public function store(Request $request)
    {
        $user = $request->user();

        if (!in_array($user->role->name, ['admin','owner'])) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $validator = Validator::make($request->all(), [
            'user_id'         => 'required|exists:user,id|unique:umkms,user_id',
            'nama_usaha'      => 'required|string|max:255',
            'lokasi'          => 'required|string',
            'nomor_telepon'   => 'required|string|max:255',
            'jam_operasional' => 'required|string',
            'menu_tersedia'   => 'required|string',
            'thumbnail'       => 'required|image|mimes:jpg,jpeg,png|max:4096',
            'fotos'           => 'required|array|min:1',
            'fotos.*'         => 'image|mimes:jpg,jpeg,png|max:4096',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $user = User::find($request->user_id);

        if ($user->role_id != 6) {
            return response()->json([
                'message' => 'User ini bukan UMKM'
            ], 400);
        }

        $thumbPath = $request->file('thumbnail')
            ->store('umkm/thumbnails', 'public');

        $umkm = Umkm::create([
            'user_id'         => $user->id,
            'nama_usaha'      => $request->nama_usaha,
            'lokasi'          => $request->lokasi,
            'nomor_telepon'   => $request->nomor_telepon,
            'jam_operasional' => $request->jam_operasional,
            'menu_tersedia'   => $request->menu_tersedia,
            'url_thumbnail'   => $thumbPath,
            'is_aktif'        => 1,
            'is_buka'         => 1
        ]);

        $user->update([
            'profile_completed' => 1
        ]);

        foreach ($request->file('fotos') as $file) {
            $path = $file->store('umkm/photos', 'public');

            UmkmFoto::create([
                'umkm_id'  => $umkm->id,
                'url_foto' => $path
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'UMKM berhasil dibuat',
            'data'    => $umkm->load('fotos')
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $user = $request->user();
        $umkm = Umkm::find($id);

        if (!$umkm) {
            return response()->json(['message' => 'UMKM tidak ditemukan'], 404);
        }

        if (
            !in_array($user->role->name, ['admin','owner']) &&
            $user->id !== $umkm->user_id
        ) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $validator = Validator::make($request->all(), [
            'nama_usaha'      => 'nullable|string|max:255',
            'lokasi'          => 'nullable|string',
            'nomor_telepon'   => 'nullable|string',
            'jam_operasional' => 'nullable|string',
            'menu_tersedia'   => 'nullable|string',
            'thumbnail'       => 'nullable|image|mimes:jpg,jpeg,png|max:2048',
            'new_fotos'       => 'nullable|array',
            'new_fotos.*'     => 'image|mimes:jpg,jpeg,png|max:2048',
            'deleted_fotos'   => 'nullable|array',
            'is_aktif'        => 'nullable|boolean'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $umkm->update($request->only([
            'nama_usaha',
            'lokasi',
            'nomor_telepon',
            'jam_operasional',
            'menu_tersedia',
            'is_aktif'
        ]));

        if ($request->has('deleted_fotos')) {
            foreach ($request->deleted_fotos as $fotoId) {
                $foto = UmkmFoto::find($fotoId);

                if ($foto) {
                    Storage::disk('public')->delete($foto->url_foto);
                    $foto->delete();

                    if ($foto->url_foto === $umkm->url_thumbnail) {
                        $umkm->url_thumbnail = null;
                    }
                }
            }
        }

        $newPhotoPaths = [];

        if ($request->hasFile('new_fotos')) {
            foreach ($request->file('new_fotos') as $file) {

                $path = $file->store('umkm/photos', 'public');

                UmkmFoto::create([
                    'umkm_id'  => $umkm->id,
                    'url_foto' => $path
                ]);

                $newPhotoPaths[] = $path;
            }
        }

        if ($request->hasFile('thumbnail')) {
            if ($umkm->url_thumbnail &&
                Storage::disk('public')->exists($umkm->url_thumbnail)) {
                Storage::disk('public')->delete($umkm->url_thumbnail);
            }

            $thumbPath = $request->file('thumbnail')
                ->store('umkm/thumbnails', 'public');

            $umkm->update([
                'url_thumbnail' => $thumbPath
            ]);
        }

        elseif ($request->has('thumbnail_index')) {
            $index = (int) $request->thumbnail_index;

            if (isset($newPhotoPaths[$index])) {

                $umkm->update([
                    'url_thumbnail' => $newPhotoPaths[$index]
                ]);
            }
        }

        elseif ($request->has('thumbnail_path')) {
            $exists = UmkmFoto::where('umkm_id',$umkm->id)
                ->where('url_foto',$request->thumbnail_path)
                ->exists();

            if ($exists) {

                $umkm->update([
                    'url_thumbnail' => $request->thumbnail_path
                ]);
            }
        }

        if (!$umkm->url_thumbnail) {
            $firstPhoto = UmkmFoto::where('umkm_id',$umkm->id)->first();

            if ($firstPhoto) {
                $umkm->update([
                    'url_thumbnail' => $firstPhoto->url_foto
                ]);
            }
        }
        
        return response()->json([
            'success' => true,
            'message' => 'UMKM berhasil diupdate',
            'data'    => $umkm->load('fotos')
        ]);
    }

    public function destroy(Request $request, $id)
    {
        $user = $request->user();

        if ($user->role->name !== 'owner') {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $umkm = Umkm::find($id);

        if (!$umkm) {
            return response()->json(['message' => 'UMKM tidak ditemukan'], 404);
        }

        if ($umkm->url_thumbnail) {
            Storage::disk('public')->delete($umkm->url_thumbnail);
        }

        foreach ($umkm->fotos as $foto) {
            Storage::disk('public')->delete($foto->url_foto);
            $foto->delete();
        }

        $umkm->user->update(['profile_completed' => 0]);
        $umkm->delete();

        return response()->json([
            'success' => true,
            'message' => 'UMKM berhasil dihapus'
        ]);
    }

    public function toggleAktif(Request $request, $id)
    {
        $user = $request->user();

        if (!in_array($user->role->name, ['admin','owner'])) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $umkm = Umkm::find($id);

        if (!$umkm) {
            return response()->json(['message' => 'UMKM tidak ditemukan'], 404);
        }

        $umkm->update([
            'is_aktif' => !$umkm->is_aktif
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Status UMKM berhasil diubah',
            'data' => $umkm
        ]);
    }

    public function toggleBuka(Request $request, $id)
    {
        $user = $request->user();
        $umkm = Umkm::find($id);

        if (!$umkm) {
            return response()->json([
                'message' => 'UMKM tidak ditemukan'
            ], 404);
        }

        if ($user->id !== $umkm->user_id) {
            return response()->json([
                'message' => 'Forbidden'
            ], 403);
        }

        if (BlockoutService::isGlobalBlocked(today(), today())) {
            if ($umkm->is_buka == 1) {
                $umkm->update(['is_buka' => 0]);
            }

            return response()->json([
                'success' => false,
                'message' => 'UMKM tidak bisa dibuka karena sedang blockout global'
            ], 422);
        }

        $umkm->update([
            'is_buka' => !$umkm->is_buka
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Status buka UMKM berhasil diubah',
            'data'    => $umkm
        ]);
    }

    public function myUmkm(Request $request)
    {
        $user = $request->user();

        $umkm = Umkm::with('fotos')
            ->where('user_id', $user->id)
            ->first();

        if (!$umkm) {
            return response()->json([
                'message' => 'UMKM belum dibuat'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $umkm
        ]);
    }

}
