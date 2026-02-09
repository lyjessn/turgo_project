<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Booking;
use App\Services\RatingService;

class RatingController extends Controller
{

   public function available($bookingId)
    {
        $booking = Booking::where('id', $bookingId)
            ->where('user_id', auth()->id())
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
            ->where('user_id', auth()->id())
            ->where('status_pemesanan', 'selesai')
            ->firstOrFail();

        $rating = RatingService::store(
            auth()->id(),
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
        return response()->json([
            'success' => true,
            'data' => RatingService::summary($tipe, $id)
        ]);
    }
}
