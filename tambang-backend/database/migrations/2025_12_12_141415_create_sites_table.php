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
       Schema::create('sites', function (Blueprint $table) {
        $table->id();

        // Identitas
        $table->string('no_site', 150)->unique();
        $table->string('name', 100);
        $table->text('description')->nullable();

        // Sistem koordinat
        $table->string('coordinate_system')->default('UTM'); 
        $table->string('utm_zone', 10); 
        $table->string('datum', 20)->default('WGS84');

        // Geometry hasil
        $table->geometry('area')->nullable();
        $table->spatialIndex('area');

        // Audit
        $table->foreignId('created_by')->constrained('users');
        $table->foreignId('updated_by')->nullable()->constrained('users');

        $table->timestamps();
    });


    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sites');
    }
};
