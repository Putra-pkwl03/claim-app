<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('blocks', function (Blueprint $table) {
            $table->id();

            // relasi
            $table->foreignId('pit_id')
                ->constrained('pits')
                ->cascadeOnDelete();

            // data block
            $table->string('name', 50);
            $table->text('description')->nullable(); 
            $table->decimal('volume', 15, 2)->nullable(); 
            $table->enum('status', ['active', 'inactive'])->default('active');

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('blocks');
    }
};
