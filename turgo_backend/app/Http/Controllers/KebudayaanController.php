<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use App\Models\Kebudayaan;
use Carbon\Carbon;

class KebudayaanController extends Controller
{
    public function index()
    {
        $kebudayaan = Kebudayaan::orderBy('id')->get();

        return response()->json([
            'message' => 'List kebudayaan berhasil diambil',
            'data' => $kebudayaan,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nama' => 'required|string|max:255',
            'deskripsi' => 'required|string',
            'foto' => 'required|image|mimes:jpg,png,jpeg|max:2048',
            'is_aktif' => 'boolean',
        ]);

        $fotoPath = null;
        if ($request->hasFile('foto')) {
            $fileName = strtolower(str_replace(' ', '_', $validated['nama'])) . '.' . $request->file('foto')->getClientOriginalExtension();
            $fotoPath = $request->file('foto')->storeAs('kebudayaan', $fileName, 'public');
        }

        $kebudayaan = Kebudayaan::create([
            'nama' => $validated['nama'],
            'deskripsi' => $validated['deskripsi'],
            'foto' => $fotoPath,
            'is_aktif' => $validated['is_aktif'] ?? true,
            'created_at' => Carbon::now('Asia/Jakarta'),
            'updated_at' => Carbon::now('Asia/Jakarta'),
        ]);

        return response()->json([
            'message' => 'Kebudayaan berhasil ditambahkan',
            'data' => $kebudayaan,
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'nama' => 'nullable|string|max:255',
            'deskripsi' => 'nullable|string',
            'foto' => 'nullable|image|mimes:jpg,png,jpeg|max:2048',
            'is_aktif' => 'nullable|boolean',
        ]);

        $kebudayaan = Kebudayaan::findOrFail($id);
        $kebudayaan->fill($validated);

        if ($request->hasFile('foto')) {
            if ($kebudayaan->foto && Storage::disk('public')->exists($kebudayaan->foto)) {
                Storage::disk('public')->delete($kebudayaan->foto);
            }
            $fileName = strtolower(str_replace(' ', '_', $kebudayaan->nama)) . '.' . $request->file('foto')->getClientOriginalExtension();
            $fotoPath = $request->file('foto')->storeAs('kebudayaan', $fileName, 'public');
            $kebudayaan->foto = $fotoPath;
        }

        $kebudayaan->updated_at = Carbon::now('Asia/Jakarta');
        $kebudayaan->save();

        return response()->json([
            'message' => 'Kebudayaan berhasil diperbarui',
            'data' => $kebudayaan,
        ]);
    }

    public function destroy($id)
    {
        $kebudayaan = Kebudayaan::findOrFail($id);

        if ($kebudayaan->foto && Storage::disk('public')->exists($kebudayaan->foto)) {
            Storage::disk('public')->delete($kebudayaan->foto);
        }

        $kebudayaan->delete();

        return response()->json(['message' => 'Kebudayaan berhasil dihapus']);
    }

    public function show($id)
    {
        try {
            $kebudayaan = Kebudayaan::findOrFail($id);
            return response()->json([
                'status' => true,
                'message' => 'Data kebudayaan',
                'data' => $kebudayaan,
            ], 200);
        } catch (\Exception $e) {
            Log::error('GetKebudayaanById Error: ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Kebudayaan tidak ditemukan',
            ], 404);
        }
    }
}
