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
        Schema::create('pit_coordinates', function (Blueprint $table) {
            $table->id();
            $table->foreignId('pit_id')->constrained()->cascadeOnDelete();

            $table->integer('point_order');     
            $table->string('point_code', 20);    

            // Koordinat utama (UTM)
            $table->decimal('easting', 12, 3);
            $table->decimal('northing', 12, 3);
            $table->decimal('elevation', 8, 3)->nullable();

            $table->timestamps();
        });

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pit_coordinates');
    }
};
