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
        Schema::create('booking_custom_pakets', function (Blueprint $table) {
            $table->unsignedBigInteger('booking_custom_id');
            $table->unsignedBigInteger('paket_wisata_id');
            $table->timestamps();

            $table->foreign('booking_custom_id')->references('booking_id')->on('booking_custom_details')->onDelete('cascade');
            $table->foreign('paket_wisata_id')->references('id')->on('paket_wisatas')->onDelete('cascade');
        });

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('booking_custom_pakets');
    }
};
