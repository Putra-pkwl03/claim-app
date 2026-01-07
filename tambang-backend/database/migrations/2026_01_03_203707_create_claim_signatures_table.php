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
        Schema::create('claim_signatures', function (Blueprint $table) {
            $table->id();
            $table->foreignId('claim_id')
                  ->constrained('surveyor_claims')
                  ->onDelete('cascade'); // hapus TTD jika claim dihapus
            $table->foreignId('user_id')
                  ->constrained('users'); // siapa yang tanda tangan
            $table->string('role'); // surveyor, managerial, finance
            $table->longText('signature')->nullable(); // base64 atau path file
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('claim_signatures');
    }
};
