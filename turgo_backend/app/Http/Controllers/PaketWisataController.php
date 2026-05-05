<?php

namespace App\Http\Controllers;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;

use App\Http\Controllers\Controller;
use App\Models\PaketWisata;
use App\Models\PaketWisataFoto;

use App\Services\BlockoutService;
use App\Services\AvailabilityService;

use Carbon\Carbon;

class PaketWisataController extends Controller
{
    public function homepage()
    {
        $oneMonthAgo = Carbon::now()->subMonth();

        $query = PaketWisata::with(['participants','fotos'])
            ->withAvg([
                'ratings as ratings_avg_bintang' => fn($q) =>
                    $q->where('tipe_target','paket_wisata')
            ], 'bintang')
            ->withCount([
                'ratings as ratings_count' => fn($q) =>
                    $q->where('tipe_target','paket_wisata')
            ])
            ->withCount([
                'bookingDetails as booking_count' => function ($q) use ($oneMonthAgo) {
                    $q->whereHas('booking', function ($b) use ($oneMonthAgo) {
                        $b->where('created_at','>=',$oneMonthAgo)
                        ->where('status_pemesanan','!=','dibatalkan');
                    });
                }
            ])
            ->where('is_aktif',1);

        // rating >4.5 & pemesanan terbanyak
        $featured = (clone $query)
            ->having('ratings_avg_bintang','>=',4.5)
            ->orderByDesc('booking_count')
            ->take(2)
            ->get();

        // pemesanan terbanyak
        if($featured->count() < 2){
            $tambahan = (clone $query)
                ->whereNotIn('id',$featured->pluck('id'))
                ->orderByDesc('booking_count')
                ->take(2-$featured->count())
                ->get();

            $featured = $featured->merge($tambahan);
        }

        // rating tertinggi
        if($featured->count() < 2){
            $tambahan = (clone $query)
                ->whereNotIn('id',$featured->pluck('id'))
                ->orderByDesc('ratings_avg_bintang')
                ->take(2-$featured->count())
                ->get();

            $featured = $featured->merge($tambahan);
        }

        // berdasarkan waktu dibuat
        if($featured->count() < 2){
            $tambahan = (clone $query)
                ->whereNotIn('id',$featured->pluck('id'))
                ->orderByDesc('created_at')
                ->take(2-$featured->count())
                ->get();

            $featured = $featured->merge($tambahan);
        }

        // paket lainnya
        $others = (clone $query)
            ->whereNotIn('id',$featured->pluck('id'))
            ->orderByDesc('booking_count')
            ->orderByDesc('ratings_avg_bintang')
            ->take(10)
            ->get();

        return response()->json([
            "success"=>true,
            "featured"=>$featured,
            "others"=>$others
        ]);
    }

    public function index(Request $request)
    {
        $query = PaketWisata::with(['participants','fotos'])
            ->withCount(['bookingDetails','ratings'])
            ->withAvg('ratings','bintang');

        $user = $request->user();

        if (!$user || !in_array($user->role->name, ['admin','owner'])) {
            $query->where('is_aktif', 1);
        }

        if ($request->has('is_aktif')) {
            $query->where('is_aktif', $request->is_aktif);
        }

        if ($request->has('search')) {
            $query->where('nama', 'like', '%' . $request->search . '%');
        }

        $data = $query
            ->orderBy('id', 'desc')
            ->get();

        return response()->json([
            "success" => true,
            "data" => $data
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

            "participants"   => "nullable|json",

            "photos"         => "required|array|min:3",
            "photos.*"       => "image|mimes:jpg,jpeg,png|max:2048",
        ]);

        if ($validator->fails()) {
            return response()->json([
                "success" => false,
                "errors"  => $validator->errors()
            ], 422);
        }

        $user = $request->user();

        if ($user->role->name === 'pelaku wisata') {

            $participants = [
                [
                    "user_id"    => $user->id,
                    "persentase" => 100
                ]
            ];

        } else {

            $participants = json_decode($request->participants, true);

            if (!is_array($participants) || count($participants) < 1) {
                return response()->json([
                    "success" => false,
                    "message" => "Participants harus diisi"
                ], 422);
            }

            $totalPersen = array_sum(array_column($participants, 'persentase'));

            if ($totalPersen != 100) {
                return response()->json([
                    "success" => false,
                    "message" => "Total persentase participant harus tepat 100%"
                ], 422);
            }
        }

        $thumbnailPath = $request->file("thumbnail")
            ->store("paket_wisata/thumbnails", "public");

        $paket = PaketWisata::create([
            "id_pembuat"     => $user->id,

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
        $paket = PaketWisata::with([
            'participants',
            'fotos',
            'ratings.user'
        ])
        ->withAvg('ratings', 'bintang')
        ->withCount('ratings')
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
        $paket = PaketWisata::with(['fotos', 'participants'])->find($id);

        if (!$paket) {
            return response()->json([
                "success" => false,
                "message" => "Paket wisata tidak ditemukan"
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            "nama"            => "sometimes|required|string|max:255",
            "kategori_paket"  => "sometimes|required|in:alam,kesenian,kebudayaan,lainnya",
            "preview"         => "sometimes|required|string",
            "deskripsi"       => "sometimes|required|string",
            "harga"           => "sometimes|required|numeric",
            "durasi"          => "sometimes|required|string",
            "lokasi"          => "sometimes|required|string",
            "perlengkapan"    => "sometimes|required|string",
            "kapasitas_min"   => "sometimes|required|integer",
            "kapasitas_max"   => "sometimes|required|integer",

            "participants"    => "nullable|json",

            "deleted_photos"  => "sometimes|array",
            "deleted_photos.*"=> "exists:paket_wisata_fotos,id",

            "new_photos"      => "sometimes|array",
            "new_photos.*"    => "image|mimes:jpg,jpeg,png|max:2048",

            "thumbnail_file"  => "sometimes|image|mimes:jpg,jpeg,png|max:2048",
            "thumbnail_path"  => "sometimes|string"
        ]);

        if ($validator->fails()) {
            return response()->json([
                "success" => false,
                "errors"  => $validator->errors()
            ], 422);
        }

        $user = $request->user();

        $paket->update($request->except([
            "id_pembuat",
            "participants",
            "deleted_photos",
            "new_photos",
            "thumbnail_file",
            "thumbnail_path"
        ]));

        if ($user->role->name === 'pelaku_wisata') {

            $syncData = [
                $user->id => [
                    "persentase" => 100
                ]
            ];

            $paket->participants()->sync($syncData);

        } else {

            if ($request->has("participants")) {

                $participants = json_decode($request->participants, true);

                if (!is_array($participants) || count($participants) < 1) {
                    return response()->json([
                        "success" => false,
                        "message" => "Participants harus diisi"
                    ], 422);
                }

                $totalPersen = array_sum(array_column($participants, 'persentase'));

                if ($totalPersen != 100) {
                    return response()->json([
                        "success" => false,
                        "message" => "Total persentase participant harus tepat 100%"
                    ], 422);
                }

                $syncData = [];

                foreach ($participants as $p) {

                    if (!isset($p['user_id']) || !isset($p['persentase'])) {
                        continue;
                    }

                    $syncData[$p["user_id"]] = [
                        "persentase" => $p["persentase"]
                    ];
                }

                $paket->participants()->sync($syncData);
            }
        }

        if ($request->has("deleted_photos")) {

            foreach ($request->deleted_photos as $fotoId) {

                $foto = PaketWisataFoto::find($fotoId);

                if ($foto) {

                    if ($paket->url_thumbnail === $foto->url_foto) {
                        $paket->url_thumbnail = null;
                    }

                    Storage::disk("public")->delete($foto->url_foto);
                    $foto->delete();
                }
            }
        }

        if ($request->hasFile("new_photos")) {

            foreach ($request->file("new_photos") as $file) {

                $path = $file->store("paket_wisata/photos", "public");

                PaketWisataFoto::create([
                    "paket_wisata_id" => $paket->id,
                    "url_foto"        => $path
                ]);
            }
        }

        if ($request->hasFile("thumbnail_file")) {

            if ($paket->url_thumbnail) {
                Storage::disk("public")->delete($paket->url_thumbnail);
            }

            $paket->url_thumbnail = $request->file("thumbnail_file")
                ->store("paket_wisata/thumbnails", "public");

        }
        elseif ($request->filled("thumbnail_path")) {
            $paket->url_thumbnail = $request->thumbnail_path;
        }

        if (!$paket->url_thumbnail) {
            $firstPhoto = PaketWisataFoto::where('paket_wisata_id', $paket->id)->first();

            if ($firstPhoto) {
                $paket->url_thumbnail = $firstPhoto->url_foto;
            }
        }

        $paket->save();

        return response()->json([
            "success" => true,
            "message" => "Paket wisata berhasil diupdate",
            "data"    => $paket->load(['participants', 'fotos'])
        ]);
    }

    public function destroy(Request $request, $id)
    {
        $user = $request->user();

        if($user->role->name !== 'owner'){
            return response()->json([
                "success" => false,
                "message" => "Unauthorized"
            ],403);
        }

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

        $paket->participants()->detach();

        $paket->delete();

        return response()->json([
            "success" => true,
            "message" => "Paket wisata berhasil dihapus"
        ]);
    }

    public function available(Request $request)
    {
        $tanggal = $request->date;

        if (BlockoutService::isGlobalBlocked($tanggal, $tanggal)) {
            return response()->json([]);
        }

        $blockedIds = BlockoutService::getBlockedIds(
            'paket_wisata',
            $tanggal
        );

        $pakets = PaketWisata::query()
            ->with(['participants','fotos'])
            ->withCount('ratings')
            ->withAvg('ratings','bintang')

            ->where('is_aktif', 1)
            ->whereNotIn('id', $blockedIds)

            ->get()

            ->filter(fn ($paket) =>
                AvailabilityService::isPaketWisataAvailable(
                    $paket->id,
                    $tanggal
                )
            )
            ->values();

        return response()->json($pakets);
    }

    public function myCreatedPakets(Request $request)
    {
        $user = $request->user();

        $data = PaketWisata::with(['participants','fotos'])
            ->withCount(['bookingDetails','ratings'])
            ->withAvg('ratings','bintang')
            ->where('id_pembuat', $user->id)
            ->latest()
            ->get();

        return response()->json([
            "success" => true,
            "data" => $data
        ]);
    }

    public function myJoinedPakets(Request $request)
    {
        $user = $request->user();

        $data = PaketWisata::with(['participants','fotos'])
            ->withCount(['bookingDetails','ratings'])
            ->withAvg('ratings','bintang')
            ->whereHas('participants', function ($q) use ($user) {
                $q->where('user_id', $user->id);
            })
            ->where('id_pembuat','!=',$user->id)
            ->latest()
            ->get();

        return response()->json([
            "success" => true,
            "data" => $data
        ]);
    }

}
