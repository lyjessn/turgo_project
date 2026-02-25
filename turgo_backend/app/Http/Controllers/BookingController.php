<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Mail;
use Carbon\Carbon;
use App\Services\BlockoutService;
use App\Services\AvailabilityService;
use App\Services\RatingService;

use App\Models\Booking;
use App\Models\PaketWisata;
use App\Models\TourGuide;
use App\Models\Kamar;
use App\Models\User;
use App\Models\BookingPaketWisataDetail;
use App\Models\BookingTourGuideDetail;
use App\Models\BookingHomestayDetail;
use App\Models\BookingCustomDetail;
use App\Models\BookingCustomPaket;

class BookingController extends Controller
{
    public function store(Request $request)
    {
        $user = $request->user();

        $request->validate([
            'tanggal_mulai'         => 'required|date',
            'tanggal_selesai'       => 'required|date|after_or_equal:tanggal_mulai',
            'bukti_pembayaran'      => 'nullable|image|mimes:jpg,jpeg,png|max:2048',
            'norek_refund'          => 'nullable|digits_between:8,20',
            'bank_refund'           => 'nullable|string|max:100',
            'nama_rekening_refund'  => 'nullable|string|max:150',
        ]);

        $total = 0;
        $tipe  = null;
        $paketIds = [];

        if ($request->filled('paket_ids')) {

            $paketIds = $request->paket_ids;
            if (!is_array($paketIds)) {
                $paketIds = explode(',', $paketIds);
            }

            $paketIds = array_map('intval', $paketIds);

            $paketIds = array_values(
                array_filter($paketIds, fn ($id) => $id > 0)
            );

            if (count($paketIds) === 0) {
                return response()->json([
                    'message' => 'Paket wisata tidak valid'
                ], 422);
            }

            $request->merge(['paket_ids' => $paketIds]);

            $request->validate([
                'paket_ids'        => 'required|array|min:1',
                'paket_ids.*'      => 'exists:paket_wisatas,id',
                'jumlah_orang'     => 'required|integer|min:1',
                'jenis_tour_guide' => 'required|in:full day,half day,tanpa',
            ]);

            foreach ($paketIds as $pid) {
                if (BlockoutService::isBlocked(
                    'paket_wisata',
                    $pid,
                    $request->tanggal_mulai,
                    $request->tanggal_selesai
                )) {
                    return response()->json([
                        'message' => "Paket ID {$pid} diblokir pada tanggal tersebut"
                    ], 422);
                }

                AvailabilityService::checkPaketWisata(
                    $pid,
                    $request->tanggal_mulai
                );
            }

            $sum   = PaketWisata::whereIn('id', $paketIds)->sum('harga');
            $total = $sum * $request->jumlah_orang;

            if ($request->jenis_tour_guide === 'full day') {
                $total += 300000;
            } elseif ($request->jenis_tour_guide === 'half day') {
                $total += 180000;
            }

            $tipe = 'custom';
        }

        elseif ($request->filled('tour_guide_id')) {
            $request->validate([
                'durasi' => 'required|in:full day,half day',
                'sesi'   => 'nullable|required_if:durasi,half day|in:pagi,siang',
            ]);

            $durasi = trim($request->durasi);

            if (BlockoutService::isBlocked(
                'tour_guide',
                $request->tour_guide_id,
                $request->tanggal_mulai,
                $request->tanggal_selesai
            )) {
                return response()->json([
                    'message' => 'Tour guide diblokir pada tanggal tersebut'
                ], 422);
            }

            AvailabilityService::checkTourGuide(
                $request->tour_guide_id,
                $request->tanggal_mulai,
                $durasi,
                $request->sesi
            );

            $tg = TourGuide::findOrFail($request->tour_guide_id);

            $hari = Carbon::parse($request->tanggal_mulai)
                ->diffInDays(Carbon::parse($request->tanggal_selesai)) + 1;

            $hargaPerHari = $tg->harga_per_hari;

            if ($durasi === 'half day') {
                $hargaPerHari /= 2;
            }

            $total = $hargaPerHari * $hari;
            $tipe  = 'tour_guide';
        }

        elseif ($request->filled('homestay_id') && $request->filled('kamar_id')) {
            if (BlockoutService::isBlocked(
                'homestay',
                $request->homestay_id,
                $request->tanggal_mulai,
                $request->tanggal_selesai
            )) {
                return response()->json([
                    'message' => 'Homestay diblokir pada tanggal tersebut'
                ], 422);
            }

            AvailabilityService::checkHomestay(
                $request->kamar_id,
                $request->tanggal_mulai,
                $request->tanggal_selesai
            );


            $kamar = Kamar::findOrFail($request->kamar_id);

            $malam = Carbon::parse($request->tanggal_mulai)
                ->diffInDays(Carbon::parse($request->tanggal_selesai));

            $total = $kamar->harga_per_malam * max($malam, 1);
            $tipe  = 'homestay';
        }


        elseif ($request->filled('paket_wisata_id')) {
            $request->validate([
                'jumlah_orang' => 'required|integer|min:1',
            ]);

            if (BlockoutService::isBlocked(
                'paket_wisata',
                $request->paket_wisata_id,
                $request->tanggal_mulai,
                $request->tanggal_selesai
            )) {
                return response()->json([
                    'message' => 'Paket wisata diblokir pada tanggal tersebut'
                ], 422);
            }

            AvailabilityService::checkPaketWisata(
                $request->paket_wisata_id,
                $request->tanggal_mulai
            );

            $paket = PaketWisata::findOrFail($request->paket_wisata_id);
            $total = $paket->harga * $request->jumlah_orang;
            $tipe  = 'paket_wisata';
        }

        else {
            return response()->json([
                'message' => 'Data booking tidak valid'
            ], 422);
        }

        $booking = Booking::create([
            'user_id'                 => $user->id,
            'tipe_booking'            => $tipe,
            'tanggal_booking'         => now(),
            'tanggal_mulai'           => $request->tanggal_mulai,
            'tanggal_selesai'         => $request->tanggal_selesai,
            'total_harga'             => $total,
            'status_pemesanan'        => 'menunggu pembayaran',
            'expired_at'              => now()->addMinutes(30),
            'bukti_pembayaran'        => null,
            'norek_refund'            => null,
            'bank_refund'             => null,
            'nama_rekening_refund'    => null,
        ]);

        if ($tipe === 'homestay') {

            BookingHomestayDetail::create([
                'booking_id'  => $booking->id,
                'homestay_id' => $request->homestay_id,
                'kamar_id'    => $request->kamar_id,
            ]);
        }

        elseif ($tipe === 'tour_guide') {
            BookingTourGuideDetail::create([
                'booking_id'    => $booking->id,
                'tour_guide_id' => $request->tour_guide_id,
                'durasi'        => $durasi,
                'sesi'          => $durasi === 'half day'
                                    ? $request->sesi
                                    : null,
            ]);
        }

        elseif ($tipe === 'paket_wisata') {

            BookingPaketWisataDetail::create([
                'booking_id'      => $booking->id,
                'paket_wisata_id' => $request->paket_wisata_id,
                'jumlah_orang'    => $request->jumlah_orang,
            ]);
        }

        elseif ($tipe === 'custom') {

            foreach ($paketIds as $pid) {
                BookingCustomDetail::create([
                    'booking_id'       => $booking->id,
                    'paket_wisata_id'  => $pid,
                    'jumlah_orang'     => $request->jumlah_orang,
                    'jenis_tour_guide' => $request->jenis_tour_guide,
                    'tour_guide_id'    => null,
                ]);
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Booking berhasil dibuat, menunggu verifikasi',
            'data'    => $booking
        ], 201);
    }

    public function confirmPayment(Request $request, $id)
    {
        $booking = Booking::findOrFail($id);

        if ($booking->status_pemesanan !== 'menunggu pembayaran') {
            return response()->json(['message' => 'Status tidak valid'], 400);
        }

        $request->validate([
            'bukti_pembayaran' => 'required|image|mimes:jpg,jpeg,png|max:2048',
            'norek_refund' => 'required|digits_between:8,20',
            'bank_refund' => 'required|string|max:100',
            'nama_rekening_refund' => 'required|string|max:150',
        ]);

        $buktiPath = $request->file('bukti_pembayaran')
            ->store('booking/bukti', 'public');

        $booking->update([
            'status_pemesanan' => 'menunggu verifikasi',
            'bukti_pembayaran' => $buktiPath,
            'norek_refund' => $request->norek_refund,
            'bank_refund' => $request->bank_refund,
            'nama_rekening_refund' => $request->nama_rekening_refund,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Pembayaran berhasil dikirim'
        ]);
    }


    public function cancel(Request $request, $id)
    {
        $user = $request->user();
        $booking = Booking::find($id);

        if (!$booking) {
            return response()->json(['message' => 'Booking tidak ditemukan'], 404);
        }

        if ($booking->user_id !== $user->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        if ($booking->status_pemesanan !== 'menunggu verifikasi') {
            return response()->json([
                'message' => 'Booking tidak dapat dibatalkan'
            ], 400);
        }

        $today = now()->startOfDay();
        $start = Carbon::parse($booking->tanggal_mulai)->startOfDay();

        if ($today->diffInDays($start, false) < 3) {
            return response()->json([
                'message' => 'Pembatalan hanya bisa maksimal H-3 sebelum kegiatan'
            ], 403);
        }

        $booking->update([
            'status_pemesanan' => 'batal'
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Booking berhasil dibatalkan'
        ]);
    }

    // INDEX (VIEW ALL)
    public function index(Request $request)
    {
        return Booking::where('user_id', $request->user()->id)
            ->orderBy('created_at', 'desc')
            ->get();
    }

    public function indexAdmin(Request $request)
    {
        return Booking::orderBy('created_at', 'desc')->get();
    }

    public function indexByTourGuide(Request $request)
    {
        $user = $request->user();

        return Booking::whereHas('tourGuideDetail', function ($q) use ($user) {
            $q->where('tour_guide_id', $user->tourGuide->id);
        })
        ->orderBy('created_at', 'desc')
        ->get();
    }

    public function indexByHomestay(Request $request)
    {
        $user = $request->user();

        return Booking::whereHas('homestayDetail.homestay', function ($q) use ($user) {
            $q->where('id_pemilik', $user->id);
        })
        ->orderBy('created_at', 'desc')
        ->get();
    }

    public function indexByPelakuWisata(Request $request)
    {
        $user = $request->user();

        return Booking::whereHas('paketWisataDetail.paket.participants', function ($q) use ($user) {
            $q->where('user_id', $user->id);
        })
        ->orWhereHas('customPakets.paket.participants', function ($q) use ($user) {
            $q->where('user_id', $user->id);
        })
        ->orderBy('created_at', 'desc')
        ->get();
    }

    //SHOW (VIEW DETAIL / VIEW BY ID)
    public function show(Request $request,$id)
    {
        return Booking::with([
            'customDetails.paketWisata',
            'paketWisataDetails.paketWisata',
            'homestayDetails.homestay',
            'homestayDetails.kamar',
            'tourGuideDetails.tourGuide'
        ])
        ->where('user_id',$request->user()->id)
        ->findOrFail($id);
    }

    public function showAdmin(Request $request, $id)
    {
        $booking = Booking::find($id);

        if (!$booking) {
            return response()->json(['message' => 'Booking tidak ditemukan'], 404);
        }

        return response()->json($booking);
    }

    public function showByTourGuide(Request $request, $id)
    {
        $user = $request->user();

        $booking = Booking::where('id', $id)
            ->whereHas('tourGuideDetail', function ($q) use ($user) {
                $q->where('tour_guide_id', $user->tourGuide->id);
            })
            ->first();

        if (!$booking) {
            return response()->json(['message' => 'Booking tidak ditemukan'], 404);
        }

        return response()->json($booking);
    }

    public function showByHomestay(Request $request, $id)
    {
        $user = $request->user();

        $booking = Booking::where('id', $id)
            ->whereHas('homestayDetail.homestay', function ($q) use ($user) {
                $q->where('id_pemilik', $user->id);
            })
            ->first();

        if (!$booking) {
            return response()->json(['message' => 'Booking tidak ditemukan'], 404);
        }

        return response()->json($booking);
    }

    public function showByPelakuWisata(Request $request, $id)
    {
        $user = $request->user();

        $booking = Booking::where('id', $id)
            ->where(function ($query) use ($user) {
                $query
                    ->whereHas('paketWisataDetail.paket.participants', function ($q) use ($user) {
                        $q->where('user_id', $user->id);
                    })
                    ->orWhereHas('customPakets.paket.participants', function ($q) use ($user) {
                        $q->where('user_id', $user->id);
                    });
            })
            ->first();

        if (!$booking) {
            return response()->json(['message' => 'Booking tidak ditemukan'], 404);
        }

        return response()->json($booking);
    }

    public function myActive(Request $request)
    {
        return Booking::where('user_id', $request->user()->id)
            ->whereIn('status_pemesanan', ['menunggu pembayaran', 'menunggu verifikasi', 'dikonfirmasi'])
            ->with([
                'paketWisataDetails.paketWisata',
                'customDetails.paketWisata',
                'homestayDetails.homestay',
                'tourGuideDetails.tourGuide'
            ])
            ->latest()
            ->get();
    }
    public function myHistory(Request $request)
    {
        $bookings = Booking::where('user_id', $request->user()->id)
            ->whereIn('status_pemesanan', [
                'selesai',
                'batal',
                'ditolak'
            ])
            ->with([
                'paketWisataDetails.paketWisata',
                'customDetails.paketWisata',
                'homestayDetails.homestay',
                'tourGuideDetails.tourGuide'
            ])
            ->latest()
            ->get();

        $bookings->transform(function ($booking) {
            $booking->sudah_rating_semua =
                RatingService::bookingSudahRatingSemua($booking);

            return $booking;
        });

        return $bookings;
    }
    public function updateStatus(Request $request, $id)
    {
        $admin = $request->user();

        if (!in_array($admin->role->name, ['admin','owner'])) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $request->validate([
            'status_pemesanan' => 'required|in:dikonfirmasi,ditolak'
        ]);

        $booking = Booking::findOrFail($id);

        $booking->update([
            'status_pemesanan' => $request->status_pemesanan
        ]);

        return response()->json([
            'success' => true,
            'data' => $booking
        ]);
    }

    public function assignTourGuide(Request $request, $id)
    {
        if ($request->user()->role->name !== 'admin') abort(403);

        $request->validate([
            'tour_guide_id' => 'required|exists:tour_guides,id'
        ]);

        DB::table('booking_custom_paket_details')
            ->where('booking_id', $id)
            ->update(['tour_guide_id' => $request->tour_guide_id]);

        return ['success' => true];
    }

    public function sendEmail(Request $request, $id)
    {
        if ($request->user()->role->name !== 'admin') abort(403);

        $request->validate(['message' => 'required|string']);

        $booking = Booking::with('user')->findOrFail($id);
        if ($booking->status_pemesanan !== 'dikonfirmasi') abort(400);

        Mail::raw($request->message, function ($m) use ($booking) {
            $m->to($booking->user->email)->subject('Informasi Booking');
        });

        return ['success' => true];
    }

    public function destroy(Request $request, $id)
    {
        if ($request->user()->role->name !== 'owner') abort(403);
        Booking::findOrFail($id)->delete();
        return ['success' => true];
    }

}
