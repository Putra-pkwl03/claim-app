<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Block extends Model
{
    protected $fillable = [
        'pit_id',
        'name',
        'description',
        'volume',
        'status',
    ];

    protected $casts = [
        'volume' => 'float',
    ];

    public function pit()
    {
        return $this->belongsTo(Pit::class);
    }
}
