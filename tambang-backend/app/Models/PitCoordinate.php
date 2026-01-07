<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PitCoordinate extends Model
{
    protected $fillable = [
        'pit_id',
        'point_order',
        'point_code',
        'easting',
        'northing',
        'elevation',
    ];

    public function pit()
    {
        return $this->belongsTo(Pit::class);
    }
}
