use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Middleware\CekRole;

Route::post('/register', [AuthController::class, 'register']);

Route::middleware('guest')->group(function () {
    Route::post('/login', [AuthController::class, 'login']);
});

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/getRole', [AuthController::class, 'getRole']);
    Route::get('/getUserData', [AuthController::class, 'getUserData']);
});

Route::middleware(['auth:sanctum', 'cekrole:admin'])->group(function () {
    // Route khusus admin
    Route::get('/admin/dashboard', [AdminDashboardController::class, 'index']);
    // Tambah route admin lainnya
});

Route::middleware(['auth:sanctum', 'cekrole:tour_guide'])->group(function () {
    // Route khusus tour_guide
    Route::get('/tourguide/profile', [TourGuideController::class, 'profile']);
    // Tambah route tour_guide lainnya
});

Route::middleware(['auth:sanctum', 'cekrole:pelaku_wisata'])->group(function () {
    // Route khusus pelaku_wisata
    Route::get('/pelaku_wisata/dashboard', [PelakuWisataController::class, 'dashboard']);
    // Tambah route pelaku_wisata lainnya
});

Route::middleware(['auth:sanctum', 'cekrole:umkm'])->group(function () {
    // Route khusus umkm
    Route::get('/umkm/dashboard', [UmkmController::class, 'dashboard']);
    // Tambah route umkm lainnya
});

// Route publik
Route::get('/paket-wisata', [PaketWisataController::class, 'index']);
Route::get('/homestay', [HomestayController::class, 'index']);
