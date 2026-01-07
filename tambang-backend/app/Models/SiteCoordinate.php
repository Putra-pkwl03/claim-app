<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SiteCoordinate extends Model
{
    protected $fillable = [
        'site_id',
        'point_order',
        'point_code',
        'easting',
        'northing',
        'elevation',
    ];

    public function site()
    {
        return $this->belongsTo(Site::class);
    }
}
