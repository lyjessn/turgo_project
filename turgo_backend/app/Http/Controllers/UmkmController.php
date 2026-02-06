<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;

use App\Models\Umkm;
use App\Models\UmkmFoto;
use App\Models\User;

class UmkmController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        if (!in_array($user->role->name, ['admin','owner'])) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $data = Umkm::with(['user','fotos'])
            ->orderBy('id', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $data
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
        $admin = $request->user();

        if (!in_array($admin->role->name, ['admin','owner'])) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $validator = Validator::make($request->all(), [
            'user_id'          => 'required|exists:user,id|unique:umkms,user_id',
            'nama_usaha'       => 'required|string|max:255',
            'lokasi'           => 'required|string',
            'nomor_telepon'    => 'required|string|max:255',
            'jam_operasional'  => 'required|string',
            'menu_tersedia'    => 'required|string',

            'thumbnail'        => 'required|image|mimes:jpg,jpeg,png|max:2048',
            'photos'           => 'required|array|min:1',
            'photos.*'         => 'image|mimes:jpg,jpeg,png|max:2048',
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

        foreach ($request->file('photos') as $photo) {
            $path = $photo->store('umkm/photos', 'public');

            UmkmFoto::create([
                'umkm_id' => $umkm->id,
                'url_foto' => $path
            ]);
        }

        $user->update(['profile_completed' => 1]);

        return response()->json([
            'success' => true,
            'message' => 'UMKM berhasil dibuat',
            'data' => $umkm->load('fotos')
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $userLogin = $request->user();
        $umkm = Umkm::find($id);

        if (!$umkm) {
            return response()->json(['message' => 'UMKM tidak ditemukan'], 404);
        }

        if (
            !in_array($userLogin->role->name, ['admin','owner']) &&
            $userLogin->id !== $umkm->user_id
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
            'is_aktif'        => 'nullable|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        if ($request->hasFile('thumbnail')) {
            if ($umkm->url_thumbnail &&
                Storage::disk('public')->exists($umkm->url_thumbnail)) {
                Storage::disk('public')->delete($umkm->url_thumbnail);
            }

            $umkm->url_thumbnail = $request->file('thumbnail')
                ->store('umkm/thumbnails', 'public');
        }

        $umkm->update($request->only([
            'nama_usaha',
            'lokasi',
            'nomor_telepon',
            'jam_operasional',
            'menu_tersedia',
            'is_aktif'
        ]));

        return response()->json([
            'success' => true,
            'message' => 'UMKM berhasil diupdate',
            'data' => $umkm
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

        $umkm->update([
            'is_buka' => !$umkm->is_buka
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Status buka UMKM berhasil diubah',
            'data' => $umkm
        ]);
    }

}
