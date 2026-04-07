<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;

use App\Http\Controllers\Controller;
use App\Models\TourGuide;
use App\Models\User;

use App\Services\BlockoutService;
use App\Services\AvailabilityService;

use Carbon\Carbon;

class TourGuideController extends Controller
{
    public function homepage()
    {
        $oneMonthAgo = Carbon::now()->subMonth();

        $query = TourGuide::with('user')
            ->withAvg([
                'ratings as ratings_avg_bintang' => fn($q) =>
                    $q->where('tipe_target','tour_guide')
            ], 'bintang')
            ->withCount([
                'ratings as ratings_count' => fn($q) =>
                    $q->where('tipe_target','tour_guide')
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

        // tahap 1 (ideal)
        $best = (clone $query)
            ->having('ratings_avg_bintang','>=',4.5)
            ->orderByDesc('booking_count')
            ->first();

        // tahap 2
        if(!$best){
            $best = (clone $query)
                ->orderByDesc('booking_count')
                ->first();
        }

        // tahap 3
        if(!$best){
            $best = (clone $query)
                ->orderByDesc('ratings_avg_bintang')
                ->first();
        }

        // tahap 4
        if(!$best){
            $best = (clone $query)
                ->orderByDesc('created_at')
                ->first();
        }

        // others (list tour guide lainnya)
        $others = (clone $query)
            ->where('id','!=',$best?->id)
            ->orderByDesc('booking_count')
            ->orderByDesc('ratings_avg_bintang')
            ->take(3)
            ->get();

        return response()->json([
            "success" => true,
            "best" => $best,
            "others" => $others
        ]);
    }

    public function getAvailableTourGuide()
    {
        $users = User::where('role_id', 5)
            ->where('profile_completed', 0)
            ->select('id','nama_lengkap')
            ->orderBy('nama_lengkap')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $users
        ]);
    }

    public function index()
    {
        $tourGuides = TourGuide::with("user")
            ->withAvg('ratings', 'bintang')
            ->withCount('ratings')
            ->orderBy("id", "desc")
            ->get();

        return response()->json([
            "success" => true,
            "data" => $tourGuides
        ]);
    }

    public function show($id)
    {
        $tourGuide = TourGuide::with([
                'user',
                'ratings.user'
            ])
            ->withAvg('ratings', 'bintang')
            ->withCount('ratings')
            ->find($id);

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

    public function available(Request $request)
    {
        $tanggal = $request->date;

        if (BlockoutService::isGlobalBlocked($tanggal, $tanggal)) {
            return response()->json([]);
        }

        $blockedIds = BlockoutService::getBlockedIds( 'tour_guide', $tanggal);

        $guides = TourGuide::query()
            ->with('user')
            ->where('is_aktif', 1)
            ->withAvg('ratings', 'bintang')
            ->withCount('ratings')
            ->whereNotIn('id', $blockedIds)
            ->get()

            ->filter(fn ($guide) =>
                AvailabilityService::isTourGuideAvailable(
                    $guide->id,
                    $tanggal,
                    'full day', 
                    null
                )
            )
            ->values();

        return response()->json($guides);
    }

    public function myTourGuide(Request $request)
    {
        $user = $request->user();

        $tourGuide = TourGuide::with(['user'])
            ->withAvg('ratings as ratings_avg_bintang', 'bintang')
            ->withCount('ratings')
            ->where('user_id', $user->id)
            ->first();

        if (!$tourGuide) {
            return response()->json([
                'success' => false,
                'message' => 'Tour Guide tidak ditemukan'
            ], 404);
        }

        return response()->json($tourGuide);
    }

}
