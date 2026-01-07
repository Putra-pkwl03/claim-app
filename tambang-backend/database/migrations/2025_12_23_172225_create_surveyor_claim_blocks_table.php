<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('surveyor_claim_blocks', function (Blueprint $table) {
            $table->id();

            $table->foreignId('surveyor_claim_id')
                ->constrained('surveyor_claims')
                ->cascadeOnDelete();
            $table->foreignId('claim_block_id')
                ->constrained('claim_blocks')
                ->cascadeOnDelete();

            $table->foreignId('block_id')
                ->constrained('blocks');

            $table->decimal('bcm', 15, 2);
            $table->decimal('amount', 15, 2)->default(0);
            $table->date('date')->nullable();
            $table->text('note')->nullable();
            $table->json('materials')->nullable();

            $table->string('file_path')->nullable();
            $table->string('file_type')->nullable();
            $table->boolean('is_surveyed')->default(false);

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('surveyor_claim_blocks');
    }
};
