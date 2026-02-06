<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('paket_wisatas', function (Blueprint $table) {
            $table->enum('kategori_paket', [
                'alam',
                'kesenian',
                'kebudayaan',
                'lainnya'
            ])->after('nama');
        });
    }

    public function down(): void
    {
        Schema::table('paket_wisatas', function (Blueprint $table) {
            $table->dropColumn('kategori_paket');
        });
    }
};
