<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ClaimSignature extends Model
{
    use HasFactory;

    protected $fillable = [
        'claim_id',
        'user_id',
        'role',
        'signature',
    ];

    // Relasi ke klaim
    public function claim()
    {
        return $this->belongsTo(SurveyorClaim::class, 'claim_id');
    }

    // Relasi ke user
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
