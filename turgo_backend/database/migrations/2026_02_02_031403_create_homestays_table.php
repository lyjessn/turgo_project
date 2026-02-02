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
        Schema::create('homestays', function (Blueprint $table) {
            $table->id();
            $table->string('nama');
            $table->foreignId('id_pemilik')->constrained('user')->onDelete('cascade');
            $table->text('lokasi');
            $table->decimal('rating')->default(0);
            $table->boolean('is_aktif')->default(true);
            $table->string('url_thumbnail');
            $table->time('check_in');
            $table->time('check_out');
            $table->text('rokok');
            $table->text('peliharaan');
            $table->timestamps();

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('homestays');
    }
};
