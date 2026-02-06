<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;

use App\Models\Homestay;
use App\Models\HomestayFoto;
use App\Models\User;
use App\Models\Kamar;

class HomestayController extends Controller
{

    public function index()
    {
        $data = Homestay::with(['pemilik', 'kamars'])
            ->orderBy('id', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $data
        ]);
    }

    public function show($id)
    {
        $homestay = Homestay::with(['pemilik', 'kamars'])->find($id);

        if (!$homestay) {
            return response()->json([
                'success' => false,
                'message' => 'Homestay tidak ditemukan'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $homestay
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

            'nama'        => 'required|string|max:255',
            'id_pemilik'  => 'required|exists:user,id|unique:homestays,id_pemilik',

            'lokasi'      => 'required|string',

            'check_in'    => 'required',
            'check_out'   => 'required',

            'rokok'       => 'required|string',
            'peliharaan'  => 'required|string',

            'thumbnail'   => 'required|image|mimes:jpg,jpeg,png|max:2048',

            'photos'      => 'required|array|min:1',
            'photos.*'    => 'image|mimes:jpg,jpeg,png|max:2048',

            'kamars'                              => 'required|array|min:1',
            'kamars.*.nama'                       => 'required|string',
            'kamars.*.harga_per_malam'            => 'required|numeric|min:0',
            'kamars.*.wifi'                       => 'nullable|string',
            'kamars.*.jumlah_kasur'               => 'required|integer|min:1',
            'kamars.*.deskripsi_kasur'             => 'nullable|string',
            'kamars.*.jumlah_toilet'               => 'required|integer|min:1',
            'kamars.*.deskripsi_toilet'            => 'nullable|string',
            'kamars.*.foto'                        => 'required|image|mimes:jpg,jpeg,png|max:2048',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors'  => $validator->errors()
            ], 422);
        }

        $user = User::find($request->id_pemilik);

        if ($user->role_id != 4) {
            return response()->json([
                'message' => 'User ini bukan pemilik Homestay'
            ], 400);
        }

        $thumbPath = $request->file('thumbnail')
            ->store('homestays/thumbnails', 'public');

        $homestay = Homestay::create([
            'nama'          => $request->nama,
            'id_pemilik'    => $request->id_pemilik,
            'lokasi'        => $request->lokasi,
            'url_thumbnail' => $thumbPath,
            'check_in'      => $request->check_in,
            'check_out'     => $request->check_out,
            'rokok'         => $request->rokok,
            'peliharaan'    => $request->peliharaan,
            'rating'        => 0,
            'is_aktif'      => 1,
        ]);

        foreach ($request->kamars as $kamar) {

            $fotoPath = $kamar['foto']->store(
                'homestays/kamars',
                'public'
            );

            Kamar::create([
                'homestay_id'        => $homestay->id,
                'nama'               => $kamar['nama'],
                'harga_per_malam'    => $kamar['harga_per_malam'],
                'wifi'               => $kamar['wifi'] ?? null,
                'jumlah_kasur'       => $kamar['jumlah_kasur'],
                'deskripsi_kasur'    => $kamar['deskripsi_kasur'] ?? null,
                'jumlah_toilet'      => $kamar['jumlah_toilet'],
                'deskripsi_toilet'   => $kamar['deskripsi_toilet'] ?? null,
                'foto'               => $fotoPath,
                'is_aktif'           => 1
            ]);
        }

        foreach ($request->file('photos') as $photo) {

            $photoPath = $photo->store('homestays/photos', 'public');

            HomestayFoto::create([
                'homestay_id' => $homestay->id,
                'url_foto'    => $photoPath
            ]);
        }

        $user->update([
            'profile_completed' => 1
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Homestay berhasil dibuat',
            'data'    => $homestay->load(['pemilik','kamars','fotos'])
        ], 201);
    }


    public function update(Request $request, $id)
    {
        $userLogin = $request->user();

        $homestay = Homestay::find($id);

        if (!$homestay) {
            return response()->json([
                "message" => "Homestay tidak ditemukan"
            ], 404);
        }

        if (
            !in_array($userLogin->role->name, ['admin','owner']) &&
            $userLogin->id != $homestay->id_pemilik
        ) {
            return response()->json([
                "message" => "Forbidden"
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'nama'       => 'nullable|string|max:255',
            'lokasi'     => 'nullable|string',
            'check_in'   => 'nullable',
            'check_out'  => 'nullable',
            'rokok'      => 'nullable|string',
            'peliharaan' => 'nullable|string',
            'thumbnail'  => 'nullable|image|mimes:jpg,jpeg,png|max:2048',
            'is_aktif'   => 'nullable|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        if ($request->hasFile('thumbnail')) {

            if ($homestay->url_thumbnail &&
                Storage::disk('public')->exists($homestay->url_thumbnail)) {
                Storage::disk('public')->delete($homestay->url_thumbnail);
            }

            $homestay->url_thumbnail = $request->file('thumbnail')
                ->store('homestays/thumbnails', 'public');
        }

        $homestay->update($request->except('thumbnail'));

        \Log::info('UPDATE HOMESTAY', [
            'request' => $request->all(),
            'fillable' => $homestay->getFillable(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Homestay berhasil diupdate',
            'data'    => $homestay->load(['pemilik','kamars'])
        ]);
    }

    public function destroy(Request $request, $id)
    {
        $userLogin = $request->user();

        if (!$userLogin || $userLogin->role->name !== "owner") {
            return response()->json([
                'message' => 'Forbidden'
            ], 403);
        }

        $homestay = Homestay::find($id);

        if (!$homestay) {
            return response()->json([
                'message' => 'Homestay tidak ditemukan'
            ], 404);
        }

        if ($homestay->url_thumbnail &&
            Storage::disk('public')->exists($homestay->url_thumbnail)) {
            Storage::disk('public')->delete($homestay->url_thumbnail);
        }

        $homestay->kamars()->delete();

        $homestay->pemilik->update([
            'profile_completed' => 0
        ]);

        $homestay->delete();

        return response()->json([
            'success' => true,
            'message' => 'Homestay berhasil dihapus'
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

        $homestay = Homestay::find($id);

        if (!$homestay) {
            return response()->json([
                'success' => false,
                'message' => 'Homestay tidak ditemukan'
            ], 404);
        }

        $homestay->update([
            'is_aktif' => !$homestay->is_aktif
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Status Homestay berhasil diubah',
            'data'    => $homestay
        ]);
    }

}
