<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;

use App\Http\Controllers\Controller;
use App\Models\Homestay;
use App\Models\HomestayFoto;
use App\Models\User;
use App\Models\Kamar;

use App\Services\BlockoutService;
use App\Services\AvailabilityService;

use Carbon\Carbon;
class HomestayController extends Controller
{
    public function homepage()
    {
        $oneMonthAgo = Carbon::now()->subMonth();

        $query = Homestay::with('fotos')
            ->withAvg([
                'ratings as ratings_avg_bintang' => fn($q) =>
                    $q->where('tipe_target','homestay')
            ], 'bintang')
            ->withCount([
                'ratings as ratings_count' => fn($q) =>
                    $q->where('tipe_target','homestay')
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

        // tahap 1
        $featured = (clone $query)
            ->having('ratings_avg_bintang','>=',4.5)
            ->orderByDesc('booking_count')
            ->first();

        // tahap 2
        if(!$featured){
            $featured = (clone $query)
                ->orderByDesc('booking_count')
                ->first();
        }

        // tahap 3
        if(!$featured){
            $featured = (clone $query)
                ->orderByDesc('ratings_avg_bintang')
                ->first();
        }

        // tahap 4
        if(!$featured){
            $featured = (clone $query)
                ->orderByDesc('created_at')
                ->first();
        }

        // others (scroll list)
        $others = (clone $query)
            ->where('id','!=',$featured?->id)
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

    public function getAvailablePemilik()
    {
        $users = User::where('role_id', 4)
            ->where('profile_completed', 0)
            ->whereDoesntHave('homestays')
            ->select('id', 'nama_lengkap', 'email')
            ->orderBy('nama_lengkap')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $users
        ]);
    }

    public function index()
    {
        $data = Homestay::query()
            ->with('pemilik')
            ->withMin('kamars', 'harga_per_malam')
            ->withMax('kamars', 'harga_per_malam')
            ->withAvg('ratings', 'bintang')
            ->withCount('ratings')
            ->orderBy('id', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $data
        ]);
    }

    public function show($id)
    {
        $homestay = Homestay::with([
            'pemilik',
            'kamars',
            'fotos',
            'ratings.user'
        ])
        ->withAvg('ratings', 'bintang')
        ->withCount('ratings')
        ->find($id);

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
            'photos' => 'required|array|min:1',
            'photos.*' => 'image|mimes:jpg,jpeg,png|max:2048',
            'thumbnail_index' => 'required|integer|min:0',

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

        $photos = $request->file('photos');
        $thumbIndex = $request->thumbnail_index;

        if (!isset($photos[$thumbIndex])) {
            return response()->json([
                'success' => false,
                'message' => 'Thumbnail index tidak valid'
            ], 422);
        }

        $thumbPath = $photos[$thumbIndex]
            ->store('homestays/thumbnails', 'public');

        $homestay = Homestay::create([
            'nama' => $request->nama,
            'id_pemilik' => $request->id_pemilik,
            'lokasi' => $request->lokasi,
            'url_thumbnail' => $thumbPath,
            'check_in' => $request->check_in,
            'check_out' => $request->check_out,
            'rokok' => $request->rokok,
            'peliharaan' => $request->peliharaan,
            'is_aktif' => 1,
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

        foreach ($photos as $photo) {
            $photoPath = $photo->store('homestays/photos', 'public');

            HomestayFoto::create([
                'homestay_id' => $homestay->id,
                'url_foto' => $photoPath
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
        $homestay = Homestay::with('fotos')->find($id);

        if (!$homestay) {
            return response()->json([
                "success" => false,
                "message" => "Homestay tidak ditemukan"
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'nama' => 'nullable|string|max:255',
            'lokasi' => 'nullable|string',
            'check_in' => 'nullable',
            'check_out' => 'nullable',
            'rokok' => 'nullable|string',
            'peliharaan' => 'nullable|string',

            'new_photos' => 'sometimes|array',
            'new_photos.*' => 'image|mimes:jpg,jpeg,png|max:2048',

            'deleted_photos' => 'sometimes|array',
            'deleted_photos.*' => 'exists:homestay_fotos,id',

            'thumbnail_path' => 'sometimes|string',
            'thumbnail_index' => 'sometimes|integer|min:0'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $homestay->update($request->only([
            'nama','lokasi','check_in','check_out','rokok','peliharaan'
        ]));

        if ($request->deleted_photos) {
            foreach ($request->deleted_photos as $photoId) {
                $foto = HomestayFoto::find($photoId);

                if ($foto) {
                    Storage::disk('public')->delete($foto->url_foto);

                    if ($homestay->url_thumbnail === $foto->url_foto) {
                        $homestay->url_thumbnail = null;
                    }

                    $foto->delete();
                }
            }
        }


        $uploadedPaths = [];

        if ($request->hasFile('new_photos')) {
            foreach ($request->file('new_photos') as $photo) {
                $path = $photo->store('homestays/photos','public');

                HomestayFoto::create([
                    'homestay_id' => $homestay->id,
                    'url_foto' => $path
                ]);

                $uploadedPaths[] = $path;
            }
        }

        if ($request->hasFile('thumbnail_file') && $request->hasFile('new_photos')) {

            foreach ($request->file('new_photos') as $index => $photo) {

                if ($photo->getClientOriginalName() === $request->file('thumbnail_file')->getClientOriginalName()) {

                    if (isset($uploadedPaths[$index])) {
                        $homestay->url_thumbnail = $uploadedPaths[$index];
                    }

                    break;
                }
            }
        }

        elseif ($request->filled('thumbnail_path')) {

            $newThumbnail = $request->thumbnail_path;

            if ($homestay->url_thumbnail !== $newThumbnail) {

                $homestay->url_thumbnail = $newThumbnail;

                if (!HomestayFoto::where('homestay_id',$homestay->id)
                    ->where('url_foto',$newThumbnail)
                    ->exists()) {

                    HomestayFoto::create([
                        'homestay_id'=>$homestay->id,
                        'url_foto'=>$newThumbnail
                    ]);
                }
            }

        }elseif ($request->hasFile('new_photos') && $request->thumbnail_index !== null) {

            if (isset($uploadedPaths[$request->thumbnail_index])) {

                $homestay->url_thumbnail = $uploadedPaths[$request->thumbnail_index];
            }
        }

        if (!$homestay->url_thumbnail) {
            $firstPhoto = HomestayFoto::where('homestay_id',$homestay->id)->first();

            if ($firstPhoto) {
                $homestay->url_thumbnail = $firstPhoto->url_foto;
            }
        }

        $homestay->save();

        return response()->json([
            'success'=>true,
            'message'=>'Homestay berhasil diupdate',
            'data'=>$homestay->load(['pemilik','kamars','fotos'])
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

    public function available(Request $request)
    {
        $checkIn  = $request->check_in;
        $checkOut = $request->check_out;

        if (BlockoutService::isGlobalBlocked($checkIn, $checkOut)) {
            return response()->json([]);
        }

        $blockedIds = BlockoutService::getBlockedIds(
            'homestay',
            $checkIn
        );

        $homestays = Homestay::query()
            ->withMin('kamars', 'harga_per_malam')
            ->withMax('kamars', 'harga_per_malam')
            ->withAvg('ratings', 'bintang')
            ->withCount('ratings')
            ->where('is_aktif', 1)
            ->whereNotIn('id', $blockedIds)
            ->get()

            ->filter(function ($homestay) use ($checkIn, $checkOut) {
                $kamars = Kamar::where('homestay_id', $homestay->id)
                    ->where('is_aktif', 1)
                    ->get();
                foreach ($kamars as $kamar) {
                    if (
                        AvailabilityService::isHomestayAvailable(
                            $kamar->id,
                            $checkIn,
                            $checkOut
                        )
                    ) {
                        return true;
                    }
                }
                return false;
            })
            ->values();

        return response()->json($homestays);
    }

    public function myHomestay(Request $request)
    {
        $user = $request->user();

        $homestay = Homestay::with(['fotos','kamars'])
            ->where('id_pemilik', $user->id)
            ->withAvg('ratings', 'bintang')
            ->withCount('ratings')
            ->first();

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
}
