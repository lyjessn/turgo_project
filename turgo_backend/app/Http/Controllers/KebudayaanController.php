<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;

use App\Models\Kebudayaan;

class KebudayaanController extends Controller
{
    public function index()
    {
        $data = Kebudayaan::where('is_aktif', 1)
            ->orderBy('id', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $data
        ]);
    }

    public function show($id)
    {
        $data = Kebudayaan::where('is_aktif', 1)->find($id);

        if (!$data) {
            return response()->json([
                'message' => 'Kebudayaan tidak ditemukan'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $data
        ]);
    }

    public function store(Request $request)
    {
        $user = $request->user();

        if (!in_array($user->role->name, ['admin','owner'])) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $validator = Validator::make($request->all(), [
            'nama'      => 'required|string|max:255',
            'deskripsi' => 'required|string',
            'foto'      => 'required|image|mimes:jpg,jpeg,png|max:2048'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $fotoPath = $request->file('foto')
            ->store('kebudayaan', 'public');

        $data = Kebudayaan::create([
            'nama'      => $request->nama,
            'deskripsi' => $request->deskripsi,
            'foto'      => $fotoPath,
            'is_aktif'  => 1
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Kebudayaan berhasil ditambahkan',
            'data' => $data
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $user = $request->user();
        $data = Kebudayaan::find($id);

        if (!$data) {
            return response()->json(['message' => 'Kebudayaan tidak ditemukan'], 404);
        }

        if (!in_array($user->role->name, ['admin','owner'])) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $validator = Validator::make($request->all(), [
            'nama'      => 'nullable|string|max:255',
            'deskripsi' => 'nullable|string',
            'foto'      => 'nullable|image|mimes:jpg,jpeg,png|max:2048',
            'is_aktif'  => 'nullable|boolean'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        if ($request->hasFile('foto')) {
            if ($data->foto && Storage::disk('public')->exists($data->foto)) {
                Storage::disk('public')->delete($data->foto);
            }

            $data->foto = $request->file('foto')
                ->store('kebudayaan', 'public');
        }

        $data->update($request->only([
            'nama',
            'deskripsi',
            'is_aktif'
        ]));

        return response()->json([
            'success' => true,
            'message' => 'Kebudayaan berhasil diupdate',
            'data' => $data
        ]);
    }

    public function destroy(Request $request, $id)
    {
        $user = $request->user();
        $data = Kebudayaan::find($id);

        if (!$data) {
            return response()->json(['message' => 'Kebudayaan tidak ditemukan'], 404);
        }

        if (!in_array($user->role->name, ['admin','owner'])) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        if ($data->foto && Storage::disk('public')->exists($data->foto)) {
            Storage::disk('public')->delete($data->foto);
        }

        $data->delete();

        return response()->json([
            'success' => true,
            'message' => 'Kebudayaan berhasil dihapus'
        ]);
    }
}
