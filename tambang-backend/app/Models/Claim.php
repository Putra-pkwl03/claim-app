<?php

namespace App\Models;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;

class Claim extends Model
{
    protected $fillable = [
        'claim_number', 
        'pt',
        'contractor_id',
        'site_id',
        'pit_id',
        'period_month',
        'period_year',
        'job_type',
        'description',
        'status',
        'total_bcm',
        'total_amount'
    ];

    public function blocks()
    {
        return $this->hasMany(ClaimBlock::class);
    }

    public function site()
    {
        return $this->belongsTo(Site::class);
    }

    public function pit()
    {
        return $this->belongsTo(Pit::class);
    }

    public function contractor()
    {
        return $this->belongsTo(User::class, 'contractor_id');
    }

    public function surveyorClaims()
    {
        return $this->hasMany(SurveyorClaim::class);
    }



}
