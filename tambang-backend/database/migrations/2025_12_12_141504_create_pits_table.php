<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pits', function (Blueprint $table) {
            $table->id();

            // Relasi
            $table->foreignId('site_id')->constrained('sites')->cascadeOnDelete();

            // Identitas
            $table->string('no_pit', 50)->unique();
            $table->string('name', 50);         
            $table->text('description')->nullable();

            // Sistem koordinat (ikut SITE, tapi disimpan eksplisit)
            $table->string('coordinate_system')->default('UTM');
            $table->string('utm_zone', 10);
            $table->string('datum', 20)->default('WGS84');

            // Geometry hasil (BUKAN input manual)
            $table->geometry('area')->nullable();
            $table->spatialIndex('area');

            // Metadata operasional
            // $table->string('jenis_material', 50)->nullable();
            $table->boolean('status_aktif')->default(true);

            // Audit
            $table->foreignId('created_by')->constrained('users');
            $table->foreignId('updated_by')->nullable()->constrained('users');

            $table->timestamps();
        });

    }

    public function down(): void
    {
        Schema::dropIfExists('pits');
    }
};

