<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;
use App\Models\Kamar;
use App\Models\Homestay;

class KamarController extends Controller
{
    public function index(Request $request)
    {
        $query = Kamar::with('homestay')
            ->where('is_aktif', 1)
            ->whereHas('homestay', function ($q) {
                $q->where('is_aktif', 1);
            });

        if ($request->has('homestay_id')) {
            $query->where('homestay_id', $request->homestay_id);
        }

        return response()->json([
            'success' => true,
            'data' => $query->orderBy('harga_per_malam', 'asc')->get()
        ]);
    }

    public function show($id)
    {
        $kamar = Kamar::with('homestay')
            ->where('is_aktif', 1)
            ->find($id);

        if (!$kamar || !$kamar->homestay->is_aktif) {
            return response()->json([
                'message' => 'Kamar tidak ditemukan'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $kamar
        ]);
    }


    public function store(Request $request)
    {
        $user = $request->user();

        $validator = Validator::make($request->all(), [
            'nama'               => 'required|string|max:255',
            'harga_per_malam'    => 'required|numeric|min:0',
            'wifi'               => 'nullable|string',
            'jumlah_kasur'       => 'required|integer|min:1',
            'deskripsi_kasur'    => 'nullable|string',
            'jumlah_toilet'      => 'required|integer|min:1',
            'deskripsi_toilet'   => 'nullable|string',
            'foto'               => 'required|image|mimes:jpg,jpeg,png|max:2048',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors'  => $validator->errors()
            ], 422);
        }

        if (in_array($user->role->name, ['admin','owner'])) {
            $request->validate([
                'homestay_id' => 'required|exists:homestays,id'
            ]);

            $homestay = Homestay::find($request->homestay_id);
        } else {
            $homestay = Homestay::where('id_pemilik', $user->id)->first();

            if (!$homestay) {
                return response()->json([
                    'message' => 'Homestay belum dibuat'
                ], 400);
            }
        }

        if (
            !in_array($user->role->name, ['admin','owner']) &&
            $user->id !== $homestay->id_pemilik
        ) {
            return response()->json([
                'message' => 'Forbidden'
            ], 403);
        }

        $fotoPath = $request->file('foto')
            ->store('homestays/kamars', 'public');

        $kamar = Kamar::create([
            'homestay_id'        => $homestay->id,
            'nama'               => $request->nama,
            'harga_per_malam'    => $request->harga_per_malam,
            'wifi'               => $request->wifi,
            'jumlah_kasur'       => $request->jumlah_kasur,
            'deskripsi_kasur'    => $request->deskripsi_kasur,
            'jumlah_toilet'      => $request->jumlah_toilet,
            'deskripsi_toilet'   => $request->deskripsi_toilet,
            'foto'               => $fotoPath,
            'is_aktif'           => 1
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Kamar berhasil dibuat',
            'data'    => $kamar
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $user = $request->user();

        if (in_array($user->role->name, ['admin','owner'])) {
            $request->validate([
                'homestay_id' => 'required|exists:homestays,id'
            ]);

            $homestay = Homestay::find($request->homestay_id);
        } else {
            $homestay = Homestay::where('id_pemilik', $user->id)->first();

            if (!$homestay) {
                return response()->json([
                    'message' => 'Homestay belum dibuat'
                ], 400);
            }
        }

        if (
            !in_array($user->role->name, ['admin','owner']) &&
            $user->id !== $homestay->id_pemilik
        ) {
            return response()->json([
                'message' => 'Forbidden'
            ], 403);
        }

        $kamar = Kamar::find($id);

        if (!$kamar) {
            return response()->json([
                'message' => 'Kamar tidak ditemukan'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'nama'               => 'nullable|string|max:255',
            'harga_per_malam'    => 'nullable|numeric|min:0',
            'wifi'               => 'nullable|string',
            'jumlah_kasur'       => 'nullable|integer|min:1',
            'deskripsi_kasur'    => 'nullable|string',
            'jumlah_toilet'      => 'nullable|integer|min:1',
            'deskripsi_toilet'   => 'nullable|string',
            'foto'               => 'nullable|image|mimes:jpg,jpeg,png|max:2048',
            'is_aktif'           => 'nullable|boolean'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors'  => $validator->errors()
            ], 422);
        }

        if ($request->hasFile('foto')) {
            if ($kamar->foto && Storage::disk('public')->exists($kamar->foto)) {
                Storage::disk('public')->delete($kamar->foto);
            }

            $kamar->foto = $request->file('foto')
                ->store('homestays/kamars', 'public');
        }

        $kamar->update($request->except('foto'));

        return response()->json([
            'success' => true,
            'message' => 'Kamar berhasil diupdate',
            'data'    => $kamar
        ]);
    }

    public function destroy(Request $request, $id)
    {
        $user = $request->user();

        if (in_array($user->role->name, ['admin','owner'])) {
            $request->validate([
                'homestay_id' => 'required|exists:homestays,id'
            ]);

            $homestay = Homestay::find($request->homestay_id);
        } else {
            $homestay = Homestay::where('id_pemilik', $user->id)->first();

            if (!$homestay) {
                return response()->json([
                    'message' => 'Homestay belum dibuat'
                ], 400);
            }
        }

        if (
            !in_array($user->role->name, ['admin','owner']) &&
            $user->id !== $homestay->id_pemilik
        ) {
            return response()->json([
                'message' => 'Forbidden'
            ], 403);
        }

        $kamar = Kamar::find($id);

        if (!$kamar) {
            return response()->json([
                'message' => 'Kamar tidak ditemukan'
            ], 404);
        }

        if ($kamar->foto && Storage::disk('public')->exists($kamar->foto)) {
            Storage::disk('public')->delete($kamar->foto);
        }

        $kamar->delete();

        return response()->json([
            'success' => true,
            'message' => 'Kamar berhasil dihapus'
        ]);
    }

    public function toggleAktif(Request $request, $id)
    {
        $user = $request->user();

         if (in_array($user->role->name, ['admin','owner'])) {
            $request->validate([
                'homestay_id' => 'required|exists:homestays,id'
            ]);

            $homestay = Homestay::find($request->homestay_id);
        } else {
            $homestay = Homestay::where('id_pemilik', $user->id)->first();

            if (!$homestay) {
                return response()->json([
                    'message' => 'Homestay belum dibuat'
                ], 400);
            }
        }

        if (
            !in_array($user->role->name, ['admin','owner']) &&
            $user->id !== $homestay->id_pemilik
        ) {
            return response()->json([
                'message' => 'Forbidden'
            ], 403);
        }

        $kamar = Kamar::find($id);

        if (!$kamar) {
            return response()->json([
                'message' => 'Kamar tidak ditemukan'
            ], 404);
        }
       
        $kamar->update([
            'is_aktif' => !$kamar->is_aktif
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Status kamar berhasil diubah',
            'data'    => $kamar
        ]);
    }
}
