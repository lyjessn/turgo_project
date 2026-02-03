<?php

use App\Http\Controllers\UmkmController;
use App\Models\Homestay;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\AuthController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\KebudayaanController;
use App\Http\Controllers\HomestayController;
use App\Http\Controllers\PaketWisataController;
use App\Http\Controllers\LaporanController;
use App\Http\Middleware\CekRole;


Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/getRole', [AuthController::class, 'getRole']);
    Route::get('/getUserData', [AuthController::class, 'getUserData']);
});

// ADMIN & OWNER
Route::middleware(['auth:sanctum', 'cekrole:owner,admin'])->group(function () {
    Route::post('/umkm/{id}/aktifkan', [UmkmController::class, 'aktifkan']);
    Route::post('/umkm/{id}/nonaktifkan', [UmkmController::class, 'nonaktifkan']);
});

// OWNER
Route::middleware(['auth:sanctum', 'cekrole:owner'])->group(function () {

    Route::delete('/kebudayaan/{id}', [KebudayaanController::class, 'destroy']);
    Route::delete('/paket-wisata/{id}', [PaketWisataController::class, 'destroy']);
    Route::delete('/homestay/{id}', [HomestayController::class, 'destroy']);
    Route::delete('/umkm/{id}', [UmkmController::class, 'destroy']);
  
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
    Route::post('/umkm/{id}/buka', [UmkmController::class, 'buka']);
    Route::post('/umkm/{id}/tutup', [UmkmController::class, 'tutup']);
});