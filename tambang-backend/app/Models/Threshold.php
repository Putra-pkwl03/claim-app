<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Threshold extends Model
{
    use HasFactory;

    protected $table = 'thresholds';

    protected $fillable = [
        'name',
        'limit_value',
        'description',
        'active'
    ];

    public static function activeThreshold()
    {
        return self::where('active', true)->first();
    }
}
