<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Booking;
use App\Services\RatingService;
use App\Models\Rating;

class RatingController extends Controller
{

    public function available(Request $request, $id)
    {
        $booking = Booking::with([
            'customDetails.paketWisata',
            'customDetails.tourGuide',
            'paketWisataDetails.paketWisata',
            'homestayDetails.homestay',
            'tourGuideDetails.tourGuide'
        ])
        ->where('id', $id)
        ->where('user_id', $request->user()->id)
        ->where('status_pemesanan', 'selesai')
        ->first();

        if (!$booking) {
            return response()->json([
                'message' => 'Booking tidak ditemukan atau belum selesai'
            ], 404);
        }

        $items = RatingService::getRateableItems($booking);

        return response()->json([
            'success' => true,
            'data' => $items
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'booking_id'  => 'required|exists:bookings,id',
            'tipe_target' => 'required|in:paket_wisata,tour_guide,homestay',
            'id_target'   => 'required|integer',
            'bintang'     => 'required|integer|min:1|max:5',
            'review'      => 'nullable|string',
        ]);

        $booking = Booking::where('id', $request->booking_id)
            ->where('user_id', $request->user()->id)
            ->where('status_pemesanan', 'selesai')
            ->firstOrFail();

        $rating = RatingService::store(
            $request->user()->id,
            $booking->id,
            $request->tipe_target,
            $request->id_target,
            $request->bintang,
            $request->review
        );

        return response()->json([
            'success' => true,
            'data' => $rating
        ], 201);
    }

    public function summary($tipe, $id)
    {
        $breakdown = Rating::where('tipe_target', $tipe)
            ->where('id_target', $id)
            ->selectRaw('bintang, COUNT(*) as total')
            ->groupBy('bintang')
            ->pluck('total', 'bintang');

        $avg = Rating::where('tipe_target', $tipe)
            ->where('id_target', $id)
            ->avg('bintang');

        $count = Rating::where('tipe_target', $tipe)
            ->where('id_target', $id)
            ->count();

        return response()->json([
            'success' => true,
            'data' => [
                'avg' => round($avg, 1),
                'count' => $count,
                'breakdown' => $breakdown
            ]
        ]);
    }

    public function listByTarget(Request $request, $tipe, $id)
    {
        if (!in_array($tipe, ['paket_wisata', 'tour_guide', 'homestay'])) {
            return response()->json([
                'message' => 'Tipe tidak valid'
            ], 400);
        }

        $query = Rating::with('user')
            ->where('tipe_target', $tipe)
            ->where('id_target', $id);

        if ($request->filled('bintang')) {
            $query->where('bintang', $request->bintang);
        }

        $ratings = $query->orderByDesc('created_at')
            ->paginate(10);

        return response()->json([
            'success' => true,
            'data' => $ratings
        ]);
    }

    public function destroy(Request $request, $id)
    {
        if (!in_array($request->user()->role->name, ['admin','owner'])) {
            abort(403);
        }

        $rating = Rating::findOrFail($id);
        $rating->delete();

        return [
            'success' => true
        ];
    }
}
