<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('booking_custom_details', function (Blueprint $table) {
            $table->unsignedBigInteger('paket_wisata_id')
                  ->after('booking_id');

            $table->foreign('paket_wisata_id')
                  ->references('id')
                  ->on('paket_wisatas')
                  ->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::table('booking_custom_details', function (Blueprint $table) {
            $table->dropForeign(['paket_wisata_id']);
            $table->dropColumn('paket_wisata_id');
        });
    }
};
