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
        Schema::create('homestay_fotos', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('homestay_id');
            $table->string('url_foto');
            $table->timestamps();

            $table->foreign('homestay_id')->references('id')->on('homestays')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('homestay_fotos');
    }
};
