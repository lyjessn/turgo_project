<?php


use App\Models\Homestay;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\UmkmController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\KebudayaanController;
use App\Http\Controllers\HomestayController;
use App\Http\Controllers\PaketWisataController;
use App\Http\Controllers\TourGuideController;
use App\Http\Controllers\KamarController;
use App\Http\Controllers\PelakuWisataController;
use App\Http\Controllers\LaporanController;
use App\Http\Middleware\CekRole;
use App\Http\Controllers\HomepageController;

//=====PUBLIC ROUTES=====
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::get('/homepage', [HomepageController::class, 'index']);

//PAKET WISATA
Route::get('/paket-wisata', [PaketWisataController::class, 'index']);
Route::get('/paket-wisata/{id}', [PaketWisataController::class, 'show']);

//HOMESTAY & KAMAR
Route::get('/homestay', [HomestayController::class, 'index']);
Route::get('/homestay/{id}', [HomestayController::class, 'show']);
Route::get('/kamar', [KamarController::class, 'index']);
Route::get('/kamar/{id}', [KamarController::class, 'show']);

//TOUR GUIDE
Route::get('/tour-guide', [TourGuideController::class, 'index']);
Route::get('/tour-guide/{id}', [TourGuideController::class, 'show']);

//KEBUDAYAAN
Route::get('/kebudayaan', [KebudayaanController::class, 'index']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/getRole', [AuthController::class, 'getRole']);
    Route::get('/getUserData', [AuthController::class, 'getUserData']);
});

// ADMIN & OWNER
Route::middleware(['auth:sanctum', 'cekrole:owner,admin'])->group(function () {
    Route::post('/umkm', [UmkmController::class, 'store']);
    Route::post('/umkm/{id}/aktifkan', [UmkmController::class, 'aktifkan']);
    Route::post('/umkm/{id}/nonaktifkan', [UmkmController::class, 'nonaktifkan']);

    Route::post('/paket-wisata', [PaketWisataController::class, 'store']);

    Route::post('/tour-guide', [TourGuideController::class, 'store']);
    Route::post('/tour-guide/{id}/toggle', [TourGuideController::class, 'toggleAktif']);

    Route::post("/homestay", [HomestayController::class, "store"]);
    Route::post("/homestay/{id}/toggle", [HomestayController::class, "toggleAktif"]);

    Route::post('/kamar/{id}/toggle', [KamarController::class, 'toggleAktif']);

    Route::get('/pelaku-wisata', [PelakuWisataController::class, 'index']);
    Route::get('/pelaku-wisata/{id}', [PelakuWisataController::class, 'show']);
    Route::post('/pelaku-wisata', [PelakuWisataController::class, 'store']);
    Route::put('/pelaku-wisata/{id}', [PelakuWisataController::class, 'update']);
    Route::post('/pelaku-wisata/{id}/toggle', [PelakuWisataController::class, 'toggleAktif']);

    Route::get('/kebudayaan', [KebudayaanController::class, 'index']);
    Route::post('/kebudayaan', [KebudayaanController::class, 'store']);
    Route::put('/kebudayaan/{id}', [KebudayaanController::class, 'update']);
    Route::post('/kebudayaan/{id}/toggle', [KebudayaanController::class, 'toggleAktif']);

});

// OWNER
Route::middleware(['auth:sanctum', 'cekrole:owner'])->group(function () {
    Route::delete('/kebudayaan/{id}', [KebudayaanController::class, 'destroy']);
    Route::delete('/paket-wisata/{id}', [PaketWisataController::class, 'destroy']);
    Route::delete('/homestay/{id}', [HomestayController::class, 'destroy']);
    Route::delete('/umkm/{id}', [UmkmController::class, 'destroy']);
    Route::delete('/tour-guide/{id}', [TourGuideController::class, 'destroy']);
    Route::delete('/pelaku-wisata/{id}', [PelakuWisataController::class, 'destroy']);
  
});

// ADMIN ONLY
Route::middleware(['auth:sanctum', 'cekrole:admin'])->group(function () {
    Route::post('/registerByAdmin', [AuthController::class, 'registerByAdmin']);
});

// ADMIN & PEMILIK UMKM
Route::middleware(['auth:sanctum', 'cekrole:admin, umkm'])->group(function () {
    Route::post('/umkm', [UmkmController::class, 'store']);
    Route::put('/umkm/{id}', [UmkmController::class, 'update']);
});

// PEMILIK UMKM ONLY
Route::middleware(['auth:sanctum', 'cekrole:umkm'])->group(function () {
    Route::post('/umkm/{id}/toggle-buka', [UmkmController::class, 'toggleBuka']);
});

//ADMIN, OWNER, PELAKU WISATA
Route::middleware(['auth:sanctum', 'cekrole:owner,admin'])->group(function () {
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
    Route::put('/umkm/{id}', [UmkmController::class, 'update']);
});