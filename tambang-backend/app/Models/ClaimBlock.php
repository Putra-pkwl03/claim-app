<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ClaimBlock extends Model
{
    use HasFactory;

    protected $fillable = [
        'claim_id',
        'block_id',
        'bcm',
        'amount',
        'date',
        'note',
        'materials',
        'file_path',
        'file_type',

    ];

    protected $casts = [
        'materials' => 'array',
        'date' => 'date',
        'bcm' => 'decimal:2',
        'amount' => 'decimal:2',
    ];

    /** RELATIONS */
    public function claim()
    {
        return $this->belongsTo(Claim::class);
    }

    public function block()
    {
        return $this->belongsTo(Block::class);
    }

      public function surveyorBlock()
    {
        return $this->hasOne(
            SurveyorClaimBlock::class,
            'claim_block_id', 
            'id'             
        );
    }

    /** ACCESSOR */
    public function getFileUrlAttribute()
    {
        return $this->file_path
            ? asset('storage/' . $this->file_path)
            : null;
    }



}
