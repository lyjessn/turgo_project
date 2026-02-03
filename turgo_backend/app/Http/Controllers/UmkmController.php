<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Umkm;
use App\Models\UmkmFoto;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;

class UmkmController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:user,id',
            'nama_usaha' => 'required|string|max:255',
            'lokasi' => 'required|string',
            'nomor_telepon' => 'required|string|max:255',
            'jam_operasional' => 'required|string',
            'menu_tersedia' => 'required|string',
            'is_aktif' => 'sometimes|boolean',
            'is_buka' => 'sometimes|boolean',
            'foto.*' => 'required|image|mimes:jpeg,png,jpg|max:2048',
        ]);

        DB::beginTransaction();

        try {
            $umkm = Umkm::create([
                'user_id' => $validated['user_id'],
                'nama_usaha' => $validated['nama_usaha'],
                'lokasi' => $validated['lokasi'],
                'nomor_telepon' => $validated['nomor_telepon'],
                'jam_operasional' => $validated['jam_operasional'],
                'menu_tersedia' => $validated['menu_tersedia'],
                'is_aktif' => $validated['is_aktif'] ?? 1,
                'is_buka' => $validated['is_buka'] ?? 1,
            ]);

            if ($request->hasFile('foto')) {
                foreach ($request->file('foto') as $file) {
                    $path = $file->store('umkm/fotos', 'public');

                    UmkmFoto::create([
                        'umkm_id' => $umkm->id,
                        'url_foto' => $path,
                    ]);
                }
            }

            DB::commit();

            return response()->json([
                'message' => 'UMKM berhasil ditambahkan',
                'data' => $umkm->load('fotos'),
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Gagal menambahkan UMKM: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function update(Request $request, $id)
    {
        $umkm = Umkm::findOrFail($id);

        $validated = $request->validate([
            'nama_usaha' => 'sometimes|string|max:255',
            'lokasi' => 'sometimes|string',
            'nomor_telepon' => 'sometimes|string|max:255',
            'jam_operasional' => 'sometimes|string',
            'menu_tersedia' => 'sometimes|string',
            'is_aktif' => 'sometimes|boolean',
            'is_buka' => 'sometimes|boolean',
            'foto.*' => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
        ]);

        try {
            $umkm->update($validated);

            if ($request->hasFile('foto')) {
                foreach ($request->file('foto') as $file) {
                    $path = $file->store('umkm/fotos', 'public');

                    UmkmFoto::create([
                        'umkm_id' => $umkm->id,
                        'url_foto' => $path,
                    ]);
                }
            }

            return response()->json([
                'message' => 'UMKM berhasil diperbarui',
                'data' => $umkm->load('fotos'),
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Gagal memperbarui UMKM: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function destroy($id)
    {
        $umkm = Umkm::with('fotos')->findOrFail($id);

        try {
            foreach ($umkm->fotos as $foto) {
                if (Storage::disk('public')->exists($foto->url_foto)) {
                    Storage::disk('public')->delete($foto->url_foto);
                }
                $foto->delete();
            }

            $umkm->delete();

            return response()->json([
                'message' => 'UMKM dan semua foto berhasil dihapus',
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Gagal menghapus UMKM: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function aktifkan($id)
    {
        $umkm = Umkm::findOrFail($id);
        $umkm->is_aktif = 1;
        $umkm->save();

        return response()->json([
            'message' => 'UMKM berhasil diaktifkan',
            'data' => $umkm,
        ]);
    }

    public function nonaktifkan($id)
    {
        $umkm = Umkm::findOrFail($id);
        $umkm->is_aktif = 0;
        $umkm->save();

        return response()->json([
            'message' => 'UMKM berhasil dinonaktifkan',
            'data' => $umkm,
        ]);
    }

    public function buka($id)
    {
        $user = auth()->user();
        $umkm = Umkm::findOrFail($id);

        if ($user->id !== $umkm->user_id) {
            return response()->json(['message' => 'Akses ditolak: Anda bukan pemilik UMKM ini'], 403);
        }

        $umkm->is_buka = 1;
        $umkm->save();

        return response()->json(['message' => 'UMKM berhasil dibuka']);
    }


    public function tutup($id)
    {
        $user = auth()->user();
        $umkm = Umkm::findOrFail($id);

        if ($user->id !== $umkm->user_id) {
            return response()->json(['message' => 'Akses ditolak: Anda bukan pemilik UMKM ini'], 403);
        }

        $umkm->is_buka = 0;
        $umkm->save();

        return response()->json([
            'message' => 'UMKM ditutup',
            'data' => $umkm,
        ]);
    }
}
