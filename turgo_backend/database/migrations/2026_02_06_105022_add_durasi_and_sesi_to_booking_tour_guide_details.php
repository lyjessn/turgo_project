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
        Schema::table('booking_tour_guide_details', function (Blueprint $table) {
            $table->enum('durasi', ['full_day', 'half_day'])->after('tour_guide_id');
            $table->enum('sesi', ['pagi', 'siang'])->nullable()->after('durasi');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('booking_tour_guide_details', function (Blueprint $table) {
            //
        });
    }
};
