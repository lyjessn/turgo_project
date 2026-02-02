<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('umkms', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained('user')->onDelete('cascade');
            $table->string('nama_usaha');
            $table->text('lokasi');
            $table->string('nomor_telepon');
            $table->text('jam_operasional');
            $table->text('menu_tersedia');
            $table->boolean('is_aktif')->default(true);
            $table->boolean('is_buka')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('umkms');
    }
};
