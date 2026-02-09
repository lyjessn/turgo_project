<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('ratings', function (Blueprint $table) {

            $table->unsignedBigInteger('booking_id')
                  ->after('user_id');

            $table->enum('tipe_target', [
                'paket_wisata',
                'tour_guide',
                'homestay'
            ])->after('booking_id');

            $table->foreign('booking_id')
                  ->references('id')
                  ->on('bookings')
                  ->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::table('ratings', function (Blueprint $table) {
            $table->dropForeign(['booking_id']);
            $table->dropColumn(['booking_id', 'tipe_target']);
        });
    }
};
