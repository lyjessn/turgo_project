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
        Schema::create('blockout_spesifiks', function (Blueprint $table) {
            $table->id();
            $table->enum('kategori', ['paket_wisata', 'tour_guide', 'homestay']);
            $table->unsignedBigInteger('id_target');
            $table->date('tanggal_mulai');
            $table->date('tanggal_selesai');
            $table->string('alasan');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('blockout_spesifiks');
    }
};
