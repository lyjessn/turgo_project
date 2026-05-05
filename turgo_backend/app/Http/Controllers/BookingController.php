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
use App\Models\Homestay;
use App\Models\Kamar;
use App\Models\User;
use App\Models\BookingPaketWisataDetail;
use App\Models\BookingTourGuideDetail;
use App\Models\BookingHomestayDetail;
use App\Models\BookingCustomDetail;
use App\Models\RiwayatSaldo;

class BookingController extends Controller
{
    public function store(Request $request)
    {
        try {

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
                    $total += 150000;
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
                'user_id' => $user->id,
                'tipe_booking' => $tipe,
                'tanggal_booking' => now(),
                'tanggal_mulai' => $request->tanggal_mulai,
                'tanggal_selesai' => $request->tanggal_selesai,
                'total_harga' => $total,
                'status_pemesanan' => 'menunggu pembayaran',
                'expired_at' => now()->addMinutes(30),
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
                    'sesi'          => $durasi === 'half day' ? $request->sesi : null,
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
                'message' => 'Booking berhasil dibuat',
                'data' => $booking
            ], 201);

        } catch (\Throwable $e) {

            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function confirmPayment(Request $request, $id)
    {
        $booking = Booking::findOrFail($id);

        if ($booking->bukti_pembayaran) {
            return response()->json([
                'message' => 'Pembayaran sudah dikirim'
            ], 400);
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
        $bookings = Booking::with([
            'user',
            'paketWisataDetails.paketWisata',
            'homestayDetails.homestay',
            'homestayDetails.kamar',
            'tourGuideDetails.tourGuide.user',
            'customDetails.paketWisata',
            'customDetails.tourGuide.user'
        ])
        ->orderBy('created_at', 'desc')
        ->get();

        return response()->json($bookings);
    }

    public function indexByTourGuide(Request $request)
    {
        $user = $request->user();

        return Booking::where(function ($query) use ($user) {

            $query->whereHas('tourGuideDetails.tourGuide', function ($q) use ($user) {
                $q->where('user_id', $user->id);
            })

            ->orWhereHas('customDetails.tourGuide', function ($q) use ($user) {
                $q->where('user_id', $user->id);
            });

        })
        ->with([
            'user',
            'tourGuideDetails.tourGuide.user',
            'customDetails.tourGuide.user',
            'customDetails.paketWisata'
        ])
        ->latest()
        ->get();
    }

    public function indexByHomestay(Request $request)
    {
        $user = $request->user();

        return Booking::whereHas('homestayDetails.homestay', function ($q) use ($user) {
            $q->where('id_pemilik', $user->id);
        })
        ->with([
            'user',
            'homestayDetails.kamar',
            'homestayDetails.homestay'
        ])
        ->latest()
        ->get();
    }

    public function indexByPelakuWisata(Request $request)
    {
        $user = $request->user();

        return Booking::where(function ($query) use ($user) {

            $query->whereHas('paketWisataDetails.paketWisata.participants', function ($q) use ($user) {
                $q->where('user_id', $user->id);
            })

            ->orWhereHas('customDetails.paketWisata.participants', function ($q) use ($user) {
                $q->where('user_id', $user->id);
            })

            ->orWhereHas('paketWisataDetails.paketWisata', function ($q) use ($user) {
                $q->where('id_pembuat', $user->id);
            })

            ->orWhereHas('customDetails.paketWisata', function ($q) use ($user) {
                $q->where('id_pembuat', $user->id);
            });

        })
        ->with([
            'user',
            'paketWisataDetails.paketWisata',
            'customDetails.paketWisata'
        ])
        ->latest()
        ->get();
    }

    public function show(Request $request,$id)
    {
        return Booking::with([
            'customDetails.paketWisata',
            'paketWisataDetails.paketWisata',
            'homestayDetails.homestay',
            'homestayDetails.kamar',
            'tourGuideDetails.tourGuide.user'
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
            ->whereHas('tourGuideDetails', function ($q) use ($user) {
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
            ->with([
                'homestayDetails.homestay',
                'homestayDetails.kamar'
            ])
            ->whereHas('homestayDetails.homestay', function ($q) use ($user) {
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
                    ->whereHas('paketWisataDetails.paket.participants', function ($q) use ($user) {
                        $q->where('user_id', $user->id);
                    })
                    ->orWhereHas('customDetails.paket.participants', function ($q) use ($user) {
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
                'tourGuideDetails.tourGuide.user'
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
                'homestayDetails.kamar',
                'tourGuideDetails.tourGuide.user'
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
            'status_pemesanan' => 'required|in:dikonfirmasi,ditolak,batal',
            'alasan_penolakan' => 'nullable|string'
        ]);

        $booking = Booking::with('user')->findOrFail($id);

        $statusLama = $booking->status_pemesanan;
        $statusBaru = $request->status_pemesanan;

        if ($statusLama === 'selesai') {
            return response()->json([
                'message' => 'Booking sudah selesai, tidak bisa diubah'
            ], 400);
        }

        if ($statusBaru === 'batal' && $statusLama !== 'dikonfirmasi') {
            return response()->json([
                'message' => 'Booking hanya bisa dibatalkan dari status dikonfirmasi'
            ], 400);
        }

        $booking->update([
            'status_pemesanan' => $statusBaru,
            'alasan_penolakan' => $statusBaru === 'ditolak'
                ? $request->alasan_penolakan
                : null
        ]);

        if ($booking->user && $booking->user->email) {

            if ($statusBaru === "dikonfirmasi") {

                $subject = "Booking Dikonfirmasi";
                $pesanLokasi = "
                <p>
                Titik kumpul berada di <b>pos satpam RT 1</b> (pos pertama dari gerbang masuk).
                Apabila terdapat perubahan lokasi atau informasi tambahan, kami akan menginformasikannya melalui email.
                </p>
                ";

                $pesanHomestay = "";

                if ($booking->tipe_booking === "homestay") {
                    $pesanHomestay = "
                    <p>
                    Serah terima kunci akan dilakukan langsung oleh pemilik homestay
                    ketika Anda sudah berada di lokasi homestay.
                    </p>
                    ";
                }

                $html = "
                    <div style='font-family:Arial;padding:20px'>

                    <h2 style='color:#2c7be5'>Desa Wisata Turgo</h2>
                    <hr>

                    <h3>Booking Anda Telah Dikonfirmasi</h3>

                    <p><b>Booking ID:</b> {$booking->id}</p>
                    <p><b>Nama Pemesan:</b> {$booking->user->nama_lengkap}</p>
                    <p><b>Tanggal Booking:</b> {$booking->tanggal_booking}</p>
                    <p><b>Tanggal Mulai:</b> {$booking->tanggal_mulai}</p>

                    <p>
                    Pembayaran Anda telah diverifikasi oleh admin.
                    Silakan datang sesuai jadwal yang telah dipilih.
                    $pesanLokasi
                    $pesanHomestay
                    </p>

                    <br>

                    <p style='font-size:12px;color:gray'>
                    Email ini dikirim otomatis oleh sistem Desa Wisata Turgo
                    </p>

                    </div>
                ";

            }

            if ($statusBaru === "ditolak") {

                $subject = "Booking Ditolak";

                $html = "
                    <div style='font-family:Arial;padding:20px'>

                    <h2 style='color:#2c7be5'>Desa Wisata Turgo</h2>
                    <hr>

                    <h3>Booking Anda Ditolak</h3>

                    <p><b>Booking ID:</b> {$booking->id}</p>
                    <p><b>Nama Pemesan:</b> {$booking->user->nama_lengkap}</p>
                    <p><b>Tanggal Booking:</b> {$booking->tanggal_booking}</p>

                    <p><b>Alasan penolakan:</b></p>

                    <p>{$request->alasan_penolakan}</p>

                    <br>

                    <p style='font-size:12px;color:gray'>
                    Email ini dikirim otomatis oleh sistem Desa Wisata Turgo
                    </p>

                    </div>
                ";
            }

            if ($statusBaru === "batal") {

                $subject = "Booking Dibatalkan";

                $html = "
                <div style='font-family:Arial;padding:20px'>
                    <h3>Booking Dibatalkan</h3>

                    <p><b>Booking ID:</b> {$booking->id}</p>
                    <p><b>Nama Pemesan:</b> {$booking->user->nama_lengkap}</p>
                    <p><b>Tanggal Booking:</b> {$booking->tanggal_booking}</p>
                    <p>
                    Mohon maaf, booking Anda telah dibatalkan oleh admin.
                    Proses refund akan dilakukan dalam waktu 3x24 jam, silahkan menghubungi admin bila anda belum menerima refund dalam 3x24 jam.
                    </p>
                </div>";
            }

            Mail::html($html, function ($mail) use ($booking, $subject) {
                $mail->to($booking->user->email)
                    ->subject($subject);
            });
        }

        return response()->json([
            'success' => true,
            'data' => $booking
        ]);
    }

    public function assignTourGuide(Request $request, $bookingId)
    {
        $tourGuideId = $request->tour_guide_id;

        $details = DB::table('booking_custom_details')
            ->where('booking_id', $bookingId)
            ->get();

        foreach ($details as $detail) {

            $harga = 0;

            if ($detail->jenis_tour_guide === 'full day') {
                $harga = 300000;
            } elseif ($detail->jenis_tour_guide === 'half day') {
                $harga = 150000;
            }

            DB::table('booking_custom_details')
                ->where('id', $detail->id)
                ->update([
                    'tour_guide_id' => $tourGuideId,
                ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Tour guide berhasil ditetapkan'
        ]);
    }

    public function sendEmail(Request $request, $id)
    {
        try {
            if (!in_array($request->user()->role->name, ['admin', 'owner'])) {
                abort(403);
            }

            $request->validate([
                'title' => 'required|string',
                'message' => 'required|string'
            ]);

            $booking = Booking::with('user')->findOrFail($id);

            if ($booking->status_pemesanan !== 'dikonfirmasi') {
                abort(400, 'Booking belum dikonfirmasi');
            }

            if (!$booking->user || !$booking->user->email) {
                abort(400, 'Email user tidak ditemukan');
            }

            $html = "
                <div style='font-family:Arial;padding:20px'>

                <h2 style='color:#2c7be5'>Desa Wisata Turgo</h2>
                <hr>

                <h3>{$request->title}</h3>

                <p><b>Booking ID:</b> {$booking->id}</p>
                <p><b>Nama Pemesan:</b> {$booking->user->nama_lengkap}</p>
                <p><b>Tanggal Booking:</b> {$booking->tanggal_booking}</p>

                <hr>

                <p>{$request->message}</p>

                <br>

                <p style='font-size:12px;color:gray'>
                Email ini dikirim otomatis oleh sistem Desa Wisata Turgo
                </p>

                </div>
            ";

            Mail::html($html, function ($mail) use ($booking, $request) {
                $mail->to($booking->user->email)
                    ->subject($request->title);
            });

            return response()->json([
                'success' => true,
                'message' => 'Email berhasil dikirim'
            ]);

        } catch (\Exception $e) {

            return response()->json([
                'success' => false,
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function sendReminderH1()
    {
        $besok = Carbon::tomorrow()->toDateString();

        $bookings = Booking::with([
            'user',
            'paketWisataDetails.paketWisata.participants',
            'paketWisataDetails.paketWisata.pembuat',
            'customDetails.paketWisata.participants',
            'customDetails.paketWisata.pembuat',
            'customDetails.tourGuide.user',
            'tourGuideDetails.tourGuide.user',
            'homestayDetails.homestay.pemilik'
        ])
        ->where('status_pemesanan','dikonfirmasi')
        ->whereDate('tanggal_mulai',$besok)
        ->get();

        foreach ($bookings as $booking) {

            $emails = [];

            // PEMESAN

            if ($booking->user && $booking->user->email) {
                $emails[] = $booking->user->email;
            }

            // TOUR GUIDE
            foreach ($booking->tourGuideDetails ?? [] as $tg) {
                if ($tg && $tg->tourGuide && $tg->tourGuide->user && $tg->tourGuide->user->email) {
                    $emails[] = $tg->tourGuide->user->email;
                }
            }

            foreach ($booking->customDetails ?? [] as $custom) {
                if ($custom && $custom->tourGuide && $custom->tourGuide->user && $custom->tourGuide->user->email) {
                    $emails[] = $custom->tourGuide->user->email;
                }
            }

            // HOMESTAY OWNER
         
            foreach ($booking->homestayDetails ?? [] as $hs) {
                if ($hs && $hs->homestay && $hs->homestay->pemilik && $hs->homestay->pemilik->email) {
                    $emails[] = $hs->homestay->pemilik->email;
                }
            }

            //  PAKET WISATA
            $pakets = [];

            foreach ($booking->paketWisataDetails ?? [] as $detail) {
                if ($detail && $detail->paketWisata) {
                    $pakets[] = $detail->paketWisata;
                }
            }

            foreach ($booking->customDetails ?? [] as $detail) {
                if ($detail && $detail->paketWisata) {
                    $pakets[] = $detail->paketWisata;
                }
            }

            foreach ($pakets as $paket) {

                if (!$paket) continue;

                // participants
                if ($paket->participants && $paket->participants->count() > 0) {

                    foreach ($paket->participants as $p) {
                        if ($p && $p->email) {
                            $emails[] = $p->email;
                        }
                    }

                } else {

                    if ($paket->pembuat && $paket->pembuat->email) {
                        $emails[] = $paket->pembuat->email;
                    }
                }
            }

            $emails = array_unique($emails);

            foreach ($emails as $email) {

                if (!$email) continue;

                try {
                    Mail::html("
                        <div style='font-family:Arial;padding:20px'>
                            <h2>Desa Wisata Turgo</h2>
                            <p>Booking ID: {$booking->id}</p>
                            <p>Kegiatan Anda dijadwalkan besok ({$booking->tanggal_mulai})</p>
                            <p>Mohon hadir sesuai jadwal.</p>
                        </div>
                    ", function($mail) use ($email) {
                        $mail->to($email)->subject("Reminder Kegiatan Besok");
                    });

                } catch (\Exception $e) {
                }
            }
        }

        return [
            'success' => true,
            'message' => 'Reminder H-1 berhasil dikirim'
        ];
    }
}
