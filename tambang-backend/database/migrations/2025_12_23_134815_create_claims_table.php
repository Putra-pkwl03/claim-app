
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
        Schema::create('claims', function (Blueprint $table) {
            $table->id();
            $table->string('claim_number')->unique();
            $table->string('pt');
            $table->foreignId('contractor_id')->constrained('users');
            $table->foreignId('site_id')->constrained('sites');
            $table->foreignId('pit_id')->constrained('pits');
            $table->tinyInteger('period_month');
            $table->integer('period_year');
            $table->string('job_type');
            $table->enum('status', [
                'draft',
                'submitted',
                'auto_approved',
                'rejected_system',
                'approved_managerial',
                'rejected_managerial',
                'approved_finance',
                'rejected_finance'
            ])->default('draft');
            $table->decimal('total_bcm', 15, 2)->default(0);
            $table->decimal('total_amount', 15, 2)->default(0); 
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('claim_blocks'); 
        Schema::dropIfExists('claims');      
    }

};