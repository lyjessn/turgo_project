<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('paket_wisatas', function (Blueprint $table) {

            if (!Schema::hasColumn('paket_wisatas', 'id_pembuat')) {

                $table->foreignId('id_pembuat')
                    ->after('id')
                    ->constrained('users')
                    ->cascadeOnDelete();

            }

        });
    }

    public function down(): void
    {
        Schema::table('paket_wisatas', function (Blueprint $table) {

            $table->dropForeign(['id_pembuat']);
            $table->dropColumn('id_pembuat');

        });
    }
};