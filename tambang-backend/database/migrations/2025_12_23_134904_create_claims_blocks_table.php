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
        Schema::create('claim_blocks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('claim_id')->constrained()->cascadeOnDelete();
            $table->foreignId('block_id')->constrained('blocks');
            $table->decimal('bcm', 15, 2);
            $table->decimal('amount', 15, 2)->default(0);
            $table->date('date')->nullable();
            $table->text('note')->nullable();
            $table->json('materials')->nullable();
            $table->string('file_path')->nullable();   
            $table->string('file_type')->nullable();   

            $table->timestamps();
        });

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('claims_blocks');
    }
};
