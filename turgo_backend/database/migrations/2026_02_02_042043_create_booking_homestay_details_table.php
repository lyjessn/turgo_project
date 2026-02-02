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
        Schema::create('booking_homestay_details', function (Blueprint $table) {
            $table->unsignedBigInteger('booking_id');
            $table->unsignedBigInteger('homestay_id');
            $table->unsignedBigInteger('kamar_id');
            $table->timestamps();

            $table->primary('booking_id');
            $table->foreign('booking_id')->references('id')->on('bookings')->onDelete('cascade');
            $table->foreign('homestay_id')->references('id')->on('homestays')->onDelete('cascade');
            $table->foreign('kamar_id')->references('id')->on('kamars')->onDelete('cascade');
        });

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('booking_homestay_details');
    }
};
