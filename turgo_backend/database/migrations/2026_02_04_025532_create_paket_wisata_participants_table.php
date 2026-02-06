<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('paket_wisata_participants', function (Blueprint $table) {
            $table->id();

            $table->foreignId('paket_wisata_id')
                  ->constrained('paket_wisatas')
                  ->onDelete('cascade');

            $table->foreignId('user_id')
                  ->constrained('user')
                  ->onDelete('cascade');

            $table->decimal('persentase', 5, 2)->default(0);

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('paket_wisata_participants');
    }
};
