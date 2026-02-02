<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::rename('pelaku_wisatas', 'pelaku_wisata');
    }

    public function down(): void
    {
        Schema::rename('pelaku_wisata', 'pelaku_wisatas');
    }
};
