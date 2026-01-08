<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SurveyorClaim extends Model
{
    use HasFactory;

    protected $table = 'surveyor_claims';

    protected $fillable = [
        'claim_number',
        'claim_id',
        'pt',
        'surveyor_id',
        'site_id',
        'pit_id',
        'period_month',
        'period_year',
        'job_type',
        'status',
        'total_bcm',
        'total_amount'
    ];

    // Relasi ke surveyor (user)
    public function surveyor()
    {
        return $this->belongsTo(User::class, 'surveyor_id');
    }

    // Relasi ke site
    public function site()
    {
        return $this->belongsTo(Site::class, 'site_id');
    }

    // Relasi ke pit
    public function pit()
    {
        return $this->belongsTo(Pit::class, 'pit_id');
    }

    // Relasi ke detail block
    public function blocks()
    {
        return $this->hasMany(SurveyorClaimBlock::class, 'surveyor_claim_id');
    }

    public function claim()
    {
        return $this->belongsTo(Claim::class);
    }

    public function signatures()
    {
        return $this->hasMany(ClaimSignature::class, 'claim_id', 'id');
    }


    /* ================= BUSINESS LOGIC ================= */
    /**
     * Cek auto approve berdasarkan total BCM semua blok
     */
    public function checkAutoApproveTotal(): bool
    {
        $threshold = \App\Models\Threshold::activeThreshold();
        if (!$threshold) {
            // \Log::info("checkAutoApproveTotal(): no active threshold found");
            return false;
        }

        // total BCM surveyor dari claim
        $totalSurveyorBcm = (float) $this->total_bcm;

        // total BCM kontraktor dari semua blok
        $totalContractorBcm = (float) $this->blocks->sum(fn($b) => $b->claimBlock ? $b->claimBlock->bcm : 0);

        // selisih
        $selisih = abs($totalSurveyorBcm - $totalContractorBcm);

        $result = $selisih <= $threshold->limit_value;

        // // debug log
        // \Log::info("=== DEBUG AUTO APPROVE TOTAL ===");
        // \Log::info("Total Surveyor BCM: {$totalSurveyorBcm}");
        // \Log::info("Total Contractor BCM: {$totalContractorBcm}");
        // \Log::info("Selisih: {$selisih}");
        // \Log::info("Threshold: {$threshold->limit_value}");
        // \Log::info("checkAutoApproveTotal(): " . ($result ? 'true' : 'false'));
        // \Log::info("===============================");

        return $result;
    }
}
