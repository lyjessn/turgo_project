<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;

use App\Models\TourGuide;
use App\Models\User;

class TourGuideController extends Controller
{
    public function index()
    {
        $tourGuides = TourGuide::with("user")
            ->orderBy("id", "desc")
            ->get();

        return response()->json([
            "success" => true,
            "data" => $tourGuides
        ]);
    }

    public function show($id)
    {
        $tourGuide = TourGuide::with("user")->find($id);

        if (!$tourGuide) {
            return response()->json([
                "success" => false,
                "message" => "Tour Guide tidak ditemukan"
            ], 404);
        }

        return response()->json([
            "success" => true,
            "data" => $tourGuide
        ]);
    }
    public function store(Request $request)
    {
        $admin = $request->user();

        if (!$admin || !in_array($admin->role->name, ['admin','owner'])) {
            return response()->json([
                'message' => 'Forbidden'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'user_id'        => 'required|exists:user,id|unique:tour_guides,user_id',

            'bio'            => 'nullable|string',

            'harga_per_hari' => 'required|numeric|min:0',

            'foto_profil'    => 'required|image|mimes:jpg,jpeg,png|max:2048',

            'bahasa'         => 'required|string',
            'spesialisasi'   => 'required|string',

            'kapasitas_min'  => 'required|integer|min:1',
            'kapasitas_max'  => 'required|integer|min:1|gte:kapasitas_min',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors'  => $validator->errors()
            ], 422);
        }

        $user = User::find($request->user_id);

        if ($user->role_id != 5) {
            return response()->json([
                'message' => 'User ini bukan Tour Guide'
            ], 400);
        }

        $fotoPath = $request->file("foto_profil")
            ->store("tour_guides/profil", "public");

        $tourGuide = TourGuide::create([
            'user_id'        => $user->id,
            'bio'            => $request->bio,

            'harga_per_hari' => $request->harga_per_hari,
            'foto_profil'    => $fotoPath,

            'bahasa'         => $request->bahasa,
            'spesialisasi'   => $request->spesialisasi,

            'kapasitas_min'  => $request->kapasitas_min,
            'kapasitas_max'  => $request->kapasitas_max,

            'is_aktif'       => 1
        ]);

        $user->update([
            'profile_completed' => 1
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Profil Tour Guide berhasil dibuat',
            'data'    => $tourGuide
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $userLogin = $request->user();

        $tourGuide = TourGuide::find($id);

        if (!$tourGuide) {
            return response()->json([
                "success" => false,
                "message" => "Tour Guide tidak ditemukan"
            ], 404);
        }

        if (
            !in_array($userLogin->role->name, ['admin','owner']) &&
            $userLogin->id != $tourGuide->user_id
        ) {
            return response()->json([
                "message" => "Forbidden"
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'bio'            => 'nullable|string',
            'harga_per_hari' => 'nullable|numeric|min:0',
            'foto_profil'    => 'nullable|image|mimes:jpg,jpeg,png|max:2048',
            'bahasa'         => 'nullable|string',
            'spesialisasi'   => 'nullable|string',
            'kapasitas_min'  => 'nullable|integer|min:1',
            'kapasitas_max'  => 'nullable|integer|min:1|gte:kapasitas_min',
            'is_aktif'       => 'nullable|boolean'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors'  => $validator->errors()
            ], 422);
        }

        if ($request->hasFile('foto_profil')) {

            if ($tourGuide->foto_profil && Storage::disk('public')->exists($tourGuide->foto_profil)) {
                Storage::disk('public')->delete($tourGuide->foto_profil);
            }

            $tourGuide->foto_profil = $request->file('foto_profil')
                ->store('tour_guides/profil', 'public');
        }

        $tourGuide->update($request->except('foto_profil'));

        return response()->json([
            'success' => true,
            'message' => 'Profil Tour Guide berhasil diupdate',
            'data'    => $tourGuide->load('user')
        ]);
    }

    public function destroy(Request $request, $id)
    {
        $admin = $request->user();

        if (!$admin || $admin->role->name !== 'owner') {
            return response()->json([
                'message" => "Forbidden'
            ], 403);
        }

        $tourGuide = TourGuide::find($id);

        if (!$tourGuide) {
            return response()->json([
                'success' => false,
                'message' => 'Tour Guide tidak ditemukan'
            ], 404);
        }

        if ($tourGuide->foto_profil && Storage::disk('public')->exists($tourGuide->foto_profil)) {
            Storage::disk('public')->delete($tourGuide->foto_profil);
        }

        $tourGuide->user->update([
            'profile_completed' => 0
        ]);

        $tourGuide->delete();

        return response()->json([
            'success' => true,
            'message' => 'Tour Guide berhasil dihapus'
        ]);
    }

    public function toggleAktif(Request $request, $id)
    {
        $admin = $request->user();

        if (!$admin || !in_array($admin->role->name, ['admin','owner'])) {
            return response()->json([
                'message' => 'Forbidden'
            ], 403);
        }

        $tourGuide = TourGuide::find($id);

        if (!$tourGuide) {
            return response()->json([
                'success' => false,
                'message' => 'Tour Guide tidak ditemukan'
            ], 404);
        }

        $tourGuide->update([
            'is_aktif' => !$tourGuide->is_aktif
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Status Tour Guide berhasil diubah',
            'data'    => $tourGuide
        ]);
    }

}
