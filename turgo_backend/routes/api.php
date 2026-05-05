<?php


use App\Models\Homestay;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\UmkmController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\KebudayaanController;
use App\Http\Controllers\HomestayController;
use App\Http\Controllers\PaketWisataController;
use App\Http\Controllers\TourGuideController;
use App\Http\Controllers\KamarController;
use App\Http\Controllers\PelakuWisataController;
use App\Http\Controllers\BookingController;
use App\Http\Controllers\BlockoutController;
use App\Http\Controllers\RatingController;
use App\Http\Controllers\RiwayatSaldoController;
use App\Http\Controllers\LaporanController;
use App\Http\Middleware\CekRole;
use App\Http\Controllers\HomepageController;

//HOMESTAY ONLY
Route::middleware(['auth:sanctum','cekrole:homestay'])->group(function () {
    Route::get('/my-homestay', [HomestayController::class, 'myHomestay']);
     Route::get('/homestay/my-kamars', [KamarController::class, 'myKamars']);
    Route::get('/homestay/my-bookings', [BookingController::class, 'indexByHomestay']);
    Route::get('/homestay/bookings/{id}', [BookingController::class, 'showByHomestay']);
});

// PELAKU WISATA ONLY
Route::middleware(['auth:sanctum','cekrole:pelaku_wisata'])->group(function () {
    Route::get('/my-created', [PaketWisataController::class, 'myCreatedPakets']);
    Route::get('/my-joined', [PaketWisataController::class, 'myJoinedPakets']);
    Route::get('/pelaku-wisata/my-bookings', [BookingController::class, 'indexByPelakuWisata']);
    Route::get('/pelaku-wisata/my-bookings/{id}', [BookingController::class, 'showByPelakuWisata']);
});

// TOUR GUIDE ONLY
Route::middleware(['auth:sanctum','cekrole:tour_guide'])->group(function () {
    Route::get('/my-tour-guide', [TourGuideController::class, 'myTourGuide']);
    Route::get('/tour-guide/my-bookings', [BookingController::class, 'indexByTourGuide']);
    Route::get('/tour-guide/my-bookings/{id}', [BookingController::class, 'showByTourGuide']);
});

// UMKM ONLY
Route::middleware(['auth:sanctum', 'cekrole:umkm'])->group(function () {
    Route::get('/my-umkm', [UmkmController::class,'myUmkm']);
    Route::post('/umkm/{id}/toggle-buka', [UmkmController::class, 'toggleBuka']);
});

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/getRole', [AuthController::class, 'getRole']);
    Route::get('/getUserData', [AuthController::class, 'getUserData']);
    Route::post('/profile/update', [UserController::class, 'updateProfile']);
});

// PENGUNJUNG ONLY
Route::middleware(['auth:sanctum', 'cekrole:pengunjung'])->group(function () {
    Route::post('/booking', [BookingController::class, 'store']);
    Route::post('/booking/{id}/confirm-payment', [BookingController::class, 'confirmPayment']);
    Route::get('/booking', [BookingController::class, 'index']);
    Route::get('/rating/available/{id}', [RatingController::class, 'available']);
    Route::post('/rating',  [RatingController::class, 'store']);
    Route::get('/booking/my/active', [BookingController::class, 'myActive']);
    Route::get('/booking/my/history', [BookingController::class, 'myHistory']);
    Route::post('/booking/{id}/cancel', [BookingController::class, 'cancel']);
    Route::get('/booking/{id}', [BookingController::class, 'show']);
});

// ADMIN, OWNER, UMKM, PELAKU WISATA, TOUR GUIDE, HOMESTAY
Route::middleware(['auth:sanctum', 'cekrole:owner,admin,pelaku_wisata,tour_guide,homestay'])->group(function () {
    Route::get('/blockout/global', [BlockoutController::class, 'indexGlobal']);
    Route::get('/blockout/spesifik', [BlockoutController::class, 'indexSpesifik']);
    Route::post('/blockout/spesifik', [BlockoutController::class, 'storeSpesifik']);
    Route::put('/blockout/spesifik/{id}', [BlockoutController::class, 'updateSpesifik']);
    Route::delete('/blockout/spesifik/{id}', [BlockoutController::class, 'destroySpesifik']);

    Route::get('/penghasilan', [RiwayatSaldoController::class, 'myIncome']);
    Route::get('/penghasilan/rekap-csv', [RiwayatSaldoController::class, 'downloadRekapCsv']);
});

// ADMIN & OWNER
Route::middleware(['auth:sanctum', 'cekrole:owner,admin'])->group(function () {
    Route::post('/registerByAdmin', [AuthController::class, 'registerByAdmin']);
    Route::post('/user/{id}', [UserController::class, 'update']);
    Route::get('/mitra', [UserController::class,'getMitra']);

    Route::get('/admin/umkm', [UmkmController::class, 'index']);
    // Route::post('/umkm', [UmkmController::class, 'store']);
    // Route::put('/umkm/{id}', [UmkmController::class, 'update']);
    Route::get('/admin/users-umkm', [UmkmController::class, 'getUsersUmkm']);

    Route::get('admin/paket-wisata', [PaketWisataController::class, 'index']);

    Route::post('/tour-guide', [TourGuideController::class, 'store']);
    Route::post('/tour-guide/{id}/toggle', [TourGuideController::class, 'toggleAktif']);
    Route::get('/users-tour-guide', [TourGuideController::class, 'getAvailableTourGuide']);

    Route::post('/homestay', [HomestayController::class, 'store']);
    Route::post('/homestay/{id}/toggle', [HomestayController::class, 'toggleAktif']);
    Route::get('/users-homestay', [HomestayController::class, 'getAvailablePemilik']);

    Route::post('/kamar/{id}/toggle', [KamarController::class, 'toggleAktif']);
    // Route::post('/kamar', [KamarController::class, 'store']);
    Route::post('kamar/{id}', [KamarController::class,'update']);

    Route::get('/pelaku-wisata', [PelakuWisataController::class, 'index']);
    Route::get('/pelaku-wisata/{id}', [PelakuWisataController::class, 'show']);
    Route::post('/pelaku-wisata', [PelakuWisataController::class, 'store']);
    Route::put('/pelaku-wisata/{id}', [PelakuWisataController::class, 'update']);
    Route::post('/pelaku-wisata/{id}/toggle', [PelakuWisataController::class, 'toggleAktif']);
    Route::get('/users-pelaku-wisata', [PelakuWisataController::class, 'getAvailablePelakuWisata']);

    Route::get('/admin/kebudayaan', [KebudayaanController::class, 'index']);
    Route::post('/kebudayaan', [KebudayaanController::class, 'store']);
    Route::put('/kebudayaan/{id}', [KebudayaanController::class, 'update']);
    Route::post('/kebudayaan/{id}/toggle', [KebudayaanController::class, 'toggleAktif']);

    Route::get('/admin/bookings', [BookingController::class, 'indexAdmin']);
    Route::get('/admin/bookings/{id}', [BookingController::class, 'showAdmin']);
    Route::post('/booking/{id}/status', [BookingController::class, 'updateStatus']);
    Route::post('/booking/{id}/send-email', [BookingController::class, 'sendEmail']);
    Route::post('booking/{id}/assign-tour-guide', [BookingController::class, 'assignTourGuide']);

    //blockout
    Route::post('/blockout/global', [BlockoutController::class, 'storeGlobal']);
    Route::put('/blockout/global/{id}', [BlockoutController::class, 'updateGlobal']);
    Route::delete('/blockout/global/{id}', [BlockoutController::class, 'destroyGlobal']);

    Route::get('/laporan/blockout/bulanan',[LaporanController::class,'laporanBlockoutBulanan']);
    Route::get('/laporan/blockout/tahunan',[LaporanController::class,'laporanBlockoutTahunan']);

    Route::delete('/ratings/{id}', [RatingController::class, 'destroy']);
});

// OWNER ONLY
Route::middleware(['auth:sanctum', 'cekrole:owner'])->group(function () {
    Route::delete('/kebudayaan/{id}', [KebudayaanController::class, 'destroy']);
    Route::delete('/paket-wisata/{id}', [PaketWisataController::class, 'destroy']);
    Route::delete('/homestay/{id}', [HomestayController::class, 'destroy']);
    Route::delete('/umkm/{id}', [UmkmController::class, 'destroy']);
    Route::delete('/tour-guide/{id}', [TourGuideController::class, 'destroy']);
    Route::delete('/pelaku-wisata/{id}', [PelakuWisataController::class, 'destroy']);
    Route::delete('/user/{id}', [UserController::class, 'destroy']);

    Route::post('/registerByOwner', [AuthController::class, 'registerByOwner']);

    Route::get('/admin', [AdminController::class,'getAdmin']);
    Route::post('/admin/{id}', [AdminController::class, 'update']);

    Route::get('/pengunjung', [UserController::class,'getPengunjung']);
    Route::post('/pengunjung/{id}', [UserController::class, 'updatePengunjung']);

    // laporan
    Route::get('/laporan/paket-wisata/bulanan',[LaporanController::class,'laporanPaketWisataBulanan']);
    Route::get('/laporan/paket-wisata/tahunan',[LaporanController::class,'laporanPaketWisataTahunan']);

    Route::get('/laporan/custom/bulanan',[LaporanController::class,'laporanCustomBulanan']);
    Route::get('/laporan/custom/tahunan',[LaporanController::class,'laporanCustomTahunan']);

    Route::get('/laporan/homestay/bulanan',[LaporanController::class,'laporanHomestayBulanan']);
    Route::get('/laporan/homestay/tahunan',[LaporanController::class,'laporanHomestayTahunan']);

    Route::get('/laporan/tourguide/bulanan',[LaporanController::class,'laporanTourGuideBulanan']);
    Route::get('/laporan/tourguide/tahunan',[LaporanController::class,'laporanTourGuideTahunan']);

    Route::get('/laporan/kategori-paket/bulanan',[LaporanController::class,'laporanKategoriPaketBulanan']);
    Route::get('/laporan/kategori-paket/tahunan',[LaporanController::class,'laporanKategoriPaketTahunan']);

    Route::get('/laporan/booking/bulanan',[LaporanController::class,'laporanBookingBulanan']);
    Route::get('/laporan/booking/tahunan',[LaporanController::class,'laporanBookingTahunan']);

    Route::get('/laporan/booking/batal/bulanan',[LaporanController::class,'laporanBookingBatalBulanan']);
    Route::get('/laporan/booking/batal/tahunan',[LaporanController::class,'laporanBookingBatalTahunan']);
});

// ADMIN ONLY
Route::middleware(['auth:sanctum', 'cekrole:admin'])->group(function () {
    Route::get('/laporan/paket-wisata/mingguan',[LaporanController::class,'laporanPaketWisataMingguan']);
    Route::get('/laporan/custom/mingguan',[LaporanController::class,'laporanCustomMingguan']);
    Route::get('/laporan/homestay/mingguan',[LaporanController::class,'laporanHomestayMingguan']);
    Route::get('/laporan/tourguide/mingguan',[LaporanController::class,'laporanTourGuideMingguan']);

    
});

//ADMIN, OWNER, PELAKU WISATA
Route::middleware(['auth:sanctum', 'cekrole:owner,admin,pelaku_wisata'])->group(function () {
    Route::post('/paket-wisata', [PaketWisataController::class, 'store']);
    Route::put('/paket-wisata/{id}', [PaketWisataController::class, 'update']);

});

//ADMIN, OWNER, TOUR GUIDE
Route::middleware(['auth:sanctum', 'cekrole:owner,admin,tour_guide'])->group(function () {
    Route::put('/tour-guide/{id}', [TourGuideController::class, 'update']);
});

// ADMIN, OWNER, HOMESTAY
Route::middleware(['auth:sanctum', 'cekrole:owner,admin,homestay'])->group(function () {
    Route::put('/homestay/{id}', [HomestayController::class, 'update']);
    Route::post('/kamar', [KamarController::class, 'store']);
    Route::put('/kamar/{id}', [KamarController::class, 'update']);
    Route::delete('/kamar/{id}', [KamarController::class, 'destroy']);
});

// ADMIN, OWNER, UMKM
Route::middleware(['auth:sanctum', 'cekrole:owner,admin,umkm'])->group(function () {
    Route::post('/umkm', [UmkmController::class, 'store']);
    Route::put('/umkm/{id}', [UmkmController::class, 'update']);
});

// PUBLIC ROUTES
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::get('/homepage', [HomepageController::class, 'index']);
Route::get('/kebudayaan', [KebudayaanController::class, 'index']);
Route::get('/umkm', [UmkmController::class, 'index']);
Route::get('/rating/summary/{tipe}/{id}', [RatingController::class, 'summary']);
Route::get('/ratings/{tipe}/{id}', [RatingController::class, 'listByTarget']);

//PAKET WISATA
Route::get('/paket-wisata/homepage', [PaketWisataController::class, 'homepage']);
Route::get('/paket-wisata/available', [PaketWisataController::class, 'available']);
Route::get('/paket-wisata', [PaketWisataController::class, 'index']);
Route::get('/paket-wisata/{id}', [PaketWisataController::class, 'show']);

//HOMESTAY & KAMAR
Route::get('/homestay/homepage', [HomestayController::class, 'homepage']);
Route::get('/homestay/available', [HomestayController::class, 'available']);
Route::get('/available-kamar', [KamarController::class, 'getAvailableKamar']);
Route::get('/homestay', [HomestayController::class, 'index']);
Route::get('/homestay/{id}', [HomestayController::class, 'show']);
Route::get('/kamar', [KamarController::class, 'index']);
Route::get('/kamar/{id}', [KamarController::class, 'show']);

//TOUR GUIDE
Route::get('/tour-guide/homepage', [TourGuideController::class, 'homepage']);
Route::get('/tour-guide/available', [TourGuideController::class, 'available']);
Route::get('/tour-guide', [TourGuideController::class, 'index']);
Route::get('/tour-guide/{id}', [TourGuideController::class, 'show']);

//pass
Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('/reset-password', [AuthController::class, 'resetPassword']);