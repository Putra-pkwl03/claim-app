<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Clickbar\Magellan\Data\Geometries\Polygon;

class Site extends Model
{
    protected $fillable = [
        'no_site',
        'name',
        'description',
        'coordinate_system',
        'utm_zone',
        'datum',
        'area',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'area' => Polygon::class,
    ];

    protected $hidden = ['area'];

    /* =====================
     | RELATIONS
     ===================== */

    public function coordinates()
    {
        return $this->hasMany(SiteCoordinate::class)->orderBy('point_order');
    }

    public function pits()
    {
        return $this->hasMany(Pit::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function updater()
    {
        return $this->belongsTo(User::class, 'updated_by');
    }
}
