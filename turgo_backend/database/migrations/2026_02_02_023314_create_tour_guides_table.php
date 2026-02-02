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
        Schema::create('tour_guides', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained('user')->onDelete('cascade');
            $table->text('bio')->nullable();
            $table->decimal('harga_per_hari', 12, 2);
            $table->string('foto_profil');
            $table->boolean('is_aktif')->default(true);
            $table->text('bahasa');
            $table->text('spesialisasi');
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
        Schema::dropIfExists('tour_guides');
    }
};
