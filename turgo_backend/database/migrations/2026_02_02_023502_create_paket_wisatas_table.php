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
        Schema::create('paket_wisatas', function (Blueprint $table) {
            $table->id();
            $table->string('nama');
            $table->text('deskripsi');
            $table->text('preview');
            $table->decimal('harga', 12, 2);
            $table->decimal('rating', 3, 2)->default(0);
            $table->boolean('is_aktif')->default(true);
            $table->string('url_thumbnail');
            $table->string('durasi');
            $table->text('lokasi');
            $table->text('perlengkapan');
            $table->integer('kapasitas_min');
            $table->integer('kapasitas_max');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('paket_wisatas');
    }
};
