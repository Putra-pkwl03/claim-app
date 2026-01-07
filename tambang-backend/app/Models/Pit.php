<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Clickbar\Magellan\Data\Geometries\Polygon;

class Pit extends Model
{
    protected $fillable = [
        'site_id',
         'no_pit',
        'name',
        'description',

        // sistem koordinat
        'coordinate_system',
        'utm_zone',
        'datum',

        // geometry hasil
        'area',

        // operasional
        // 'jenis_material',
        'status_aktif',

        // audit
        'created_by',
        'updated_by',
    ];

        protected $casts = [
        // tetap boleh untuk save/update
        'area' => Polygon::class,
        'status_aktif' => 'boolean',
    ];


    protected $hidden = [
        'area', 
    ];

    /* =====================
     | RELATIONS
     ===================== */

    public function site()
    {
        return $this->belongsTo(Site::class);
    }

    public function coordinates()
    {
        return $this->hasMany(PitCoordinate::class)->orderBy('point_order');
    }

    public function blocks()
    {
        return $this->hasMany(Block::class);
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
