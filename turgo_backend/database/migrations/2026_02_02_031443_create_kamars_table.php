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
        Schema::create('kamars', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('homestay_id');
            $table->string('nama');
            $table->decimal('harga_per_malam');
            $table->text('wifi')->nullable();
            $table->integer('jumlah_kasur');
            $table->text('deskripsi_kasur')->nullable();
            $table->integer('jumlah_toilet');
            $table->text('deskripsi_toilet')->nullable();
            $table->boolean('is_aktif')->default(true);
            $table->timestamps();

            $table->foreign('homestay_id')->references('id')->on('homestays')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('kamars');
    }
};
