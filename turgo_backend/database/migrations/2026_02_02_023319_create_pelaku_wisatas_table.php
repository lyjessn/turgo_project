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
        Schema::create('pelaku_wisatas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained('user')->onDelete('cascade');
            $table->string('nama_usaha');
            $table->text('deskripsi')->nullable();
            $table->text('alamat');
            $table->string('nomor_telepon');
            $table->string('foto_profil')->nullable();
            $table->boolean('is_aktif')->default(true);
            $table->timestamps();
        });

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pelaku_wisatas');
    }
};
