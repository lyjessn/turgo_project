<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;

use App\Models\PelakuWisata;
use App\Models\User;

class PelakuWisataController extends Controller
{
    public function index(Request $request)
    {
        $admin = $request->user();

        if (!in_array($admin->role->name, ['admin','owner'])) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $data = PelakuWisata::with('user')
            ->where('is_aktif', 1)
            ->orderBy('id', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $data
        ]);
    }

    public function show(Request $request, $id)
    {
        $admin = $request->user();

        if (!in_array($admin->role->name, ['admin','owner'])) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $pelaku = PelakuWisata::with('user')
            ->where('is_aktif', 1)
            ->find($id);

        if (!$pelaku) {
            return response()->json([
                'message' => 'Pelaku wisata tidak ditemukan'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $pelaku
        ]);
    }

    public function store(Request $request)
    {
        $admin = $request->user();

        if (!in_array($admin->role->name, ['admin','owner'])) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $validator = Validator::make($request->all(), [
            'user_id'       => 'required|exists:user,id|unique:pelaku_wisata,user_id',
            'nama_usaha'    => 'required|string|max:255',
            'deskripsi'     => 'nullable|string',
            'lokasi'        => 'required|string',
            'nomor_telepon' => 'required|string|max:255',
            'foto_profil'   => 'nullable|image|mimes:jpg,jpeg,png|max:2048'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $user = User::find($request->user_id);

        if ($user->role_id != 3) {
            return response()->json([
                'message' => 'User ini bukan pelaku wisata'
            ], 400);
        }

        $fotoPath = null;
        if ($request->hasFile('foto_profil')) {
            $fotoPath = $request->file('foto_profil')
                ->store('pelaku_wisata/profil', 'public');
        }

        $pelaku = PelakuWisata::create([
            'user_id'       => $user->id,
            'nama_usaha'    => $request->nama_usaha,
            'deskripsi'     => $request->deskripsi,
            'lokasi'        => $request->lokasi,
            'nomor_telepon' => $request->nomor_telepon,
            'foto_profil'   => $fotoPath,
            'is_aktif'      => 1
        ]);

        $user->update(['profile_completed' => 1]);

        return response()->json([
            'success' => true,
            'message' => 'Pelaku wisata berhasil dibuat',
            'data' => $pelaku
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $userLogin = $request->user();
        $pelaku = PelakuWisata::find($id);

        if (!$pelaku) {
            return response()->json([
                'message' => 'Pelaku wisata tidak ditemukan'
            ], 404);
        }

        if (
            !in_array($userLogin->role->name, ['admin','owner']) &&
            $userLogin->id !== $pelaku->user_id
        ) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $validator = Validator::make($request->all(), [
            'nama_usaha'    => 'nullable|string|max:255',
            'deskripsi'     => 'nullable|string',
            'lokasi'        => 'nullable|string',
            'nomor_telepon' => 'nullable|string|max:255',
            'foto_profil'   => 'nullable|image|mimes:jpg,jpeg,png|max:2048',
            'is_aktif'      => 'nullable|boolean'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        if ($request->hasFile('foto_profil')) {
            if ($pelaku->foto_profil &&
                Storage::disk('public')->exists($pelaku->foto_profil)) {
                Storage::disk('public')->delete($pelaku->foto_profil);
            }

            $pelaku->foto_profil = $request->file('foto_profil')
                ->store('pelaku_wisata/profil', 'public');
        }

        $pelaku->update($request->except('foto_profil'));

        return response()->json([
            'success' => true,
            'message' => 'Pelaku wisata berhasil diupdate',
            'data' => $pelaku->load('user')
        ]);
    }

    public function destroy(Request $request, $id)
    {
        $user = $request->user();

        if ($user->role->name !== 'owner') {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $pelaku = PelakuWisata::find($id);

        if (!$pelaku) {
            return response()->json([
                'message' => 'Pelaku wisata tidak ditemukan'
            ], 404);
        }

        if ($pelaku->foto_profil &&
            Storage::disk('public')->exists($pelaku->foto_profil)) {
            Storage::disk('public')->delete($pelaku->foto_profil);
        }

        $pelaku->user->update(['profile_completed' => 0]);
        $pelaku->delete();

        return response()->json([
            'success' => true,
            'message' => 'Pelaku wisata berhasil dihapus'
        ]);
    }

    public function toggleAktif(Request $request, $id)
    {
        $user = $request->user();

        if (!in_array($user->role->name, ['admin','owner'])) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $pelaku = PelakuWisata::find($id);

        if (!$pelaku) {
            return response()->json([
                'message' => 'Pelaku wisata tidak ditemukan'
            ], 404);
        }

        $pelaku->update([
            'is_aktif' => !$pelaku->is_aktif
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Status pelaku wisata berhasil diubah',
            'data' => $pelaku
        ]);
    }
}
