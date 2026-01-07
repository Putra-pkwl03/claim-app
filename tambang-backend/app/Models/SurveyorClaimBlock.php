<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SurveyorClaimBlock extends Model
{
    use HasFactory;

    protected $table = 'surveyor_claim_blocks';

    protected $fillable = [
        'surveyor_claim_id',
        'pt',
        'claim_block_id', 
        'block_id',
        'bcm',
        'amount',
        'date',
        'note',
        'materials',
        'file_path',
        'file_type',
        'is_surveyed',
    ];

    protected $casts = [
        'materials' => 'array',
        'date'      => 'date',
    ];

    /* ================= RELATION ================= */

    public function surveyorClaim()
    {
        return $this->belongsTo(SurveyorClaim::class);
    }

    public function block()
    {
        return $this->belongsTo(Block::class);
    }

    /**
     * Claim block milik contractor (satu-satu, eksplisit)
     */
    public function claimBlock()
    {
        return $this->belongsTo(ClaimBlock::class);
    }

    public function surveyor()
    {
        return $this->belongsTo(User::class, 'surveyor_id');
    }

    /* ================= HELPER ================= */

    public function isPdf(): bool
    {
        return $this->file_type === 'pdf';
    }

    public function isImage(): bool
    {
        return $this->file_type === 'image';
    }

    public function fileUrl(): ?string
    {
        return $this->file_path
            ? asset('storage/' . $this->file_path)
            : null;
    }
}




// public function checkAutoApprove(): bool
// {
//     if (!$this->claimBlock) {
//         \Log::info("checkAutoApprove(): claimBlock null");
//         return false;
//     }

//     $threshold = \App\Models\Threshold::activeThreshold();
//     if (!$threshold) {
//         \Log::info("checkAutoApprove(): no active threshold found");
//         return false;
//     }

//     // Logika pengecekan waktu 30 detik
//     $timeDifference = $this->created_at->diffInSeconds(now());
//     if ($timeDifference < 30) {
//         \Log::info("checkAutoApprove(): masih < 30 detik, auto-approve ditunda");
//         return false; // Jika waktu < 30 detik, klaim ditunda dan tidak langsung di-approve
//     }

//     // Hitung selisih BCM
//     $selisih = abs((float)$this->bcm - (float)$this->claimBlock->bcm);
//     $result = $selisih <= $threshold->limit_value;

//     // Debug log opsional
//     \Log::info("=== DEBUG AUTO APPROVE ===");
//     \Log::info("Surveyor BCM: {$this->bcm}");
//     \Log::info("Contractor BCM: {$this->claimBlock->bcm}");
//     \Log::info("Selisih BCM: {$selisih}");
//     \Log::info("Threshold: {$threshold->limit_value}");
//     \Log::info("checkAutoApprove(): " . ($result ? 'true' : 'false'));
//     \Log::info("==========================");

//     return $result;
// }
