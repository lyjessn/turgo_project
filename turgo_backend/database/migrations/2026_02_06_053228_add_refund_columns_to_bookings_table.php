<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->string('norek_refund')->nullable()->after('bukti_pembayaran');
            $table->string('nama_rekening_refund')->nullable()->after('norek_refund');
            $table->string('bank_refund')->nullable()->after('nama_rekening_refund');
        });
    }

    public function down(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->dropColumn([
                'norek_refund',
                'nama_rekening_refund',
                'bank_refund'
            ]);
        });
    }
};
