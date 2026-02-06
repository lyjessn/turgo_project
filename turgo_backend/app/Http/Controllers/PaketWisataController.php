<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\PaketWisata;
use App\Models\PaketWisataFoto;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;

class PaketWisataController extends Controller
{
    public function index()
    {
        $pakets = PaketWisata::with(['pelakuWisatas', 'fotos'])
            ->where('is_aktif', 1)
            ->latest()
            ->paginate(10);

        return response()->json([
            "success" => true,
            "message" => "List Paket Wisata",
            "data" => $pakets
        ]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            "nama"           => "required|string|max:255",
            "kategori_paket" => "required|in:alam,kesenian,kebudayaan,lainnya",
            "deskripsi"      => "required|string",
            "preview"        => "required|string",
            "harga"          => "required|numeric",
            "durasi"         => "required|string",
            "lokasi"         => "required|string",
            "perlengkapan"   => "required|string",

            "kapasitas_min"  => "required|integer",
            "kapasitas_max"  => "required|integer",

            "thumbnail"      => "required|image|mimes:jpg,jpeg,png|max:2048",
            "participants"   => "required|json",

            "photos"         => "required|array|min:3",
            "photos.*"       => "image|mimes:jpg,jpeg,png|max:2048",
        ]);

        if ($validator->fails()) {
            return response()->json([
                "success" => false,
                "errors" => $validator->errors()
            ], 422);
        }
        
        $participants = json_decode($request->participants, true);
        if (!is_array($participants) || count($participants) < 1) {
            return response()->json([
                "success" => false,
                "message" => "Participants harus berupa array"
            ], 422);
        }

        $totalPersen = array_sum(array_column($participants, 'persentase'));

        if ($totalPersen != 100) {
            return response()->json([
                "success" => false,
                "message" => "Total persentase participant harus tepat 100%"
            ], 422);
        }

        $thumbnailPath = $request->file("thumbnail")
            ->store("paket_wisata/thumbnails", "public");

        $paket = PaketWisata::create([
            "nama"           => $request->nama,
            "kategori_paket" => $request->kategori_paket,
            "deskripsi"      => $request->deskripsi,
            "preview"        => $request->preview,
            "harga"          => $request->harga,

            "durasi"         => $request->durasi,
            "lokasi"         => $request->lokasi,
            "perlengkapan"   => $request->perlengkapan,

            "kapasitas_min"  => $request->kapasitas_min,
            "kapasitas_max"  => $request->kapasitas_max,

            "url_thumbnail"  => $thumbnailPath,
            "rating"         => 0,
            "is_aktif"       => 1
        ]);

        $syncData = [];

        foreach ($participants as $p) {
            if (!isset($p['user_id']) || !isset($p['persentase'])) {
                continue;
            }

            $syncData[$p['user_id']] = [
                "persentase" => $p['persentase']
            ];
        }

        $paket->participants()->sync($syncData);

        foreach ($request->file("photos") as $photo) {

            $photoPath = $photo->store("paket_wisata/photos", "public");

            PaketWisataFoto::create([
                "paket_wisata_id" => $paket->id,
                "url_foto"        => $photoPath
            ]);
        }

        return response()->json([
            "success" => true,
            "message" => "Paket wisata berhasil dibuat",
            "data"    => $paket->load(['participants', 'fotos'])
        ]);
    }

    public function show($id)
    {
        $paket = PaketWisata::with(['pelakuWisatas', 'fotos'])
            ->find($id);

        if (!$paket) {
            return response()->json([
                "success" => false,
                "message" => "Paket wisata tidak ditemukan"
            ], 404);
        }

        return response()->json([
            "success" => true,
            "data" => $paket
        ]);
    }

    public function update(Request $request, $id)
    {
        $paket = PaketWisata::find($id);

        if (!$paket) {
            return response()->json([
                "success" => false,
                "message" => "Paket wisata tidak ditemukan"
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            "nama"           => "sometimes|required|string|max:255",
            "kategori_paket" => "sometimes|required|in:alam,kesenian,kebudayaan,lainnya",
            "harga"          => "sometimes|required|numeric",

            "pelaku_ids"     => "sometimes|array|min:1",
            "pelaku_ids.*"   => "exists:pelaku_wisata,id",

            "thumbnail"      => "sometimes|image|mimes:jpg,jpeg,png|max:2048",

            "photos"         => "sometimes|array|min:3",
            "photos.*"       => "image|mimes:jpg,jpeg,png|max:2048",
        ]);

        if ($validator->fails()) {
            return response()->json([
                "success" => false,
                "errors" => $validator->errors()
            ], 422);
        }

        if ($request->hasFile("thumbnail")) {

            if ($paket->url_thumbnail) {
                Storage::disk("public")->delete($paket->url_thumbnail);
            }

            $paket->url_thumbnail = $request->file("thumbnail")
                ->store("paket_wisata/thumbnails", "public");
        }

        $paket->update($request->except(["pelaku_ids", "photos", "thumbnail"]));

        if ($request->has("pelaku_ids")) {
            $paket->pelakuWisatas()->sync($request->pelaku_ids);
        }

        if ($request->hasFile("photos")) {
            foreach ($paket->fotos as $foto) {
                Storage::disk("public")->delete($foto->url_foto);
                $foto->delete();
            }

            foreach ($request->file("photos") as $photo) {

                $photoPath = $photo->store("paket_wisata/photos", "public");

                PaketWisataFoto::create([
                    "paket_wisata_id" => $paket->id,
                    "url_foto"        => $photoPath
                ]);
            }
        }

        return response()->json([
            "success" => true,
            "message" => "Paket wisata berhasil diupdate",
            "data" => $paket->load(['pelakuWisatas', 'fotos'])
        ]);
    }

    public function destroy($id)
    {
        $paket = PaketWisata::with("fotos")->find($id);

        if (!$paket) {
            return response()->json([
                "success" => false,
                "message" => "Paket wisata tidak ditemukan"
            ], 404);
        }

        if ($paket->url_thumbnail) {
            Storage::disk("public")->delete($paket->url_thumbnail);
        }

        foreach ($paket->fotos as $foto) {
            Storage::disk("public")->delete($foto->url_foto);
            $foto->delete();
        }

        $paket->pelakuWisatas()->detach();

        $paket->delete();

        return response()->json([
            "success" => true,
            "message" => "Paket wisata berhasil dihapus"
        ]);
    }
}
