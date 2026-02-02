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
        Schema::create('paket_wisata_pelakus', function (Blueprint $table) {
            $table->foreignId('paket_wisata_id')->constrained('paket_wisatas')->onDelete('cascade');
            $table->foreignId('pelaku_wisata_id')->constrained('pelaku_wisatas')->onDelete('cascade');
            $table->decimal('persentase', 5, 2);
            $table->timestamps();

            $table->primary(['paket_wisata_id', 'pelaku_wisata_id']);
        });

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('paket_wisata_pelakus');
    }
};
