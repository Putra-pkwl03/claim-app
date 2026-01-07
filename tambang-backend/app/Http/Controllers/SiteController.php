<?php

namespace App\Http\Controllers;

use App\Models\Site;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Clickbar\Magellan\Data\Geometries\Polygon;
use Clickbar\Magellan\Data\Geometries\LineString;
use Clickbar\Magellan\Data\Geometries\Point;

class SiteController extends Controller
{
    /* =====================
     | LIST SITE
     ===================== */
    public function index()
    {
        return Site::with(['coordinates', 'pits.blocks', 'pits.coordinates'])
            ->get()
            ->map(function ($site) {

                $site_luas = DB::table('sites')
                    ->where('id', $site->id)
                    ->selectRaw('ST_Area(area) as st_area')
                    ->value('st_area');

                $latlng = $site->coordinates
                    ->sortBy('point_order')
                    ->map(fn ($c) =>
                        $this->utmToLatLng(
                            (float) $c->easting,
                            (float) $c->northing,
                            $site->utm_zone
                        )
                    )
                    ->values();
                    
                     $totalBlocks = $site->pits->flatMap(fn($p) => $p->blocks)->count();

                return [
                    'id'          => $site->id,
                    'no_site'     => $site->no_site,
                    'name'        => $site->name,
                    'description' => $site->description,
                    'luas_m2'     => $site_luas,
                    'utm_zone'    => $site->utm_zone,

                    'coordinates' => $site->coordinates,
                    'coordinates_latlng' => $latlng,

                    'pit_count'   => $site->pits->count(),
                     'block_count' => $totalBlocks, 

                    'pits' => $site->pits->map(function ($pit) use ($site) {

                        $pit_luas = DB::table('pits')
                            ->where('id', $pit->id)
                            ->selectRaw('ST_Area(area) as st_area')
                            ->value('st_area');

                        $pit_latlng = $pit->coordinates
                            ->sortBy('point_order')
                            ->map(fn ($c) =>
                                $this->utmToLatLng(
                                    (float) $c->easting,
                                    (float) $c->northing,
                                    $site->utm_zone
                                )
                            )
                            ->values();

                        return [
                            'id'                  => $pit->id,
                            'site_id'             => $pit->site_id,
                            'no_pit'              => $pit->no_pit,
                            'name'                => $pit->name,
                            'description'         => $pit->description,
                            'jenis_material'      => $pit->jenis_material,
                            'status_aktif'        => $pit->status_aktif,
                            'luas_m2'             => $pit_luas,
                            'coordinates'         => $pit->coordinates,
                            'coordinates_latlng'  => $pit_latlng,
                            'blocks' => $pit->blocks->map(function ($block) use ($pit) {
                                return [
                                    'id'          => $block->id,
                                      'pit_id'      => $pit->id,
                                    'name'        => $block->name,
                                    'description' => $block->description,
                                    'volume'      => $block->volume,
                                    'status'      => $block->status,
                                ];
                            }),
                        ];
                    }),
                ];
            });
    }


    /* =====================
     | CREATE SITE
     ===================== */
    public function store(Request $request)
    {
        $data = $request->validate([
            'name'        => 'required|string|max:100',
            'description' => 'nullable|string',
            'utm_zone'    => 'required|string|max:10',

            'coordinates'               => 'required|array|min:4|max:6',
            'coordinates.*.point_order' => 'required|integer',
            'coordinates.*.easting'     => 'required|numeric',
            'coordinates.*.northing'    => 'required|numeric',
        ]);

        return DB::transaction(fn () =>
            response()->json($this->createSingleSite($data), 201)
        );
    }


   /* =====================
| UPDATE SITE
===================== */
public function update(Request $request, Site $site)
{
    $data = $request->validate([
        'name'        => 'required|string|max:100',
        'description' => 'nullable|string',
        'utm_zone'    => 'required|string|max:10',

        'coordinates'               => 'required|array|min:4|max:6',
        'coordinates.*.point_order' => 'required|integer',
        'coordinates.*.easting'     => 'required|numeric',
        'coordinates.*.northing'    => 'required|numeric',
    ]);

    return DB::transaction(function () use ($data, $site) {

        // UPDATE SITE
        $site->update([
            'name'        => $data['name'],
            'description' => $data['description'] ?? $site->description,
            'utm_zone'    => $data['utm_zone'],
            'updated_by'  => auth()->id(),
        ]);

        // Hapus koordinat lama
        $site->coordinates()->delete();

        // Tambah koordinat baru
        foreach ($data['coordinates'] as $coord) {
            $site->coordinates()->create($coord);
        }

        // Update area dan no_site
        $site->update([
            'area'    => $this->buildPolygon($site->coordinates),
            'no_site' => $this->generateNoSite($site->name, $data['coordinates']),
        ]);

        return response()->json($site->load('coordinates'), 200);
    });
}

        /* =====================
    | SHOW SITE
    ===================== */
    public function show($id)
    {
        $site = Site::with(['coordinates', 'pits.blocks', 'pits.coordinates'])
            ->find($id);

        if (!$site) {
            return response()->json(['message' => 'Site not found'], 404);
        }

        $site_luas = DB::table('sites')
            ->where('id', $site->id)
            ->selectRaw('ST_Area(area) as st_area')
            ->value('st_area');

        $latlng = $site->coordinates
            ->sortBy('point_order')
            ->map(fn ($c) =>
                $this->utmToLatLng(
                    (float) $c->easting,
                    (float) $c->northing,
                    $site->utm_zone
                )
            )
            ->values();

        return response()->json([
            'id'          => $site->id,
            'no_site'     => $site->no_site,
            'name'        => $site->name,
            'description' => $site->description,
            'luas_m2'     => $site_luas,
            'utm_zone'    => $site->utm_zone,

            'coordinates'         => $site->coordinates,
            'coordinates_latlng'  => $latlng,

            'pit_count' => $site->pits->count(),

            'pits' => $site->pits->map(function ($pit) use ($site) {

                $pit_luas = DB::table('pits')
                    ->where('id', $pit->id)
                    ->selectRaw('ST_Area(area) as st_area')
                    ->value('st_area');

                $pit_latlng = $pit->coordinates
                    ->sortBy('point_order')
                    ->map(fn ($c) =>
                        $this->utmToLatLng(
                            (float) $c->easting,
                            (float) $c->northing,
                            $site->utm_zone
                        )
                    )
                    ->values();

                return [
                    'id'                 => $pit->id,
                    'site_id'            => $pit->site_id,
                    'no_pit'             => $pit->no_pit,
                    'name'               => $pit->name,
                    'description'        => $pit->description,
                    'jenis_material'     => $pit->jenis_material,
                    'status_aktif'       => $pit->status_aktif,
                    'luas_m2'            => $pit_luas,
                    'coordinates'        => $pit->coordinates,
                    'coordinates_latlng' => $pit_latlng,
                    'blocks'             => $pit->blocks->map(fn($block) => [
                        'id'          => $block->id,
                        'name'        => $block->name,
                        'description' => $block->description,
                        'volume'      => $block->volume,
                        'status'      => $block->status,
                    ]),
                ];
            }),
        ]);
    }


    /* =====================
     | DELETE
     ===================== */
    public function destroy(Site $site)
    {
        $site->delete();
        return response()->json(['message' => 'Site deleted']);
    }

    /* =====================
     | CREATE SINGLE SITE
     ===================== */
    private function createSingleSite(array $siteData)
    {
        if (count($siteData['coordinates']) < 4 || count($siteData['coordinates']) > 6) {
            throw new \Exception('Polygon harus 4–6 titik');
        }

        $noSite = $this->generateNoSite(
            $siteData['name'],
            $siteData['coordinates']
        );

        $site = Site::create([
            'no_site'           => $noSite,
            'name'              => $siteData['name'],
            'description'       => $siteData['description'] ?? null,
            'coordinate_system' => 'UTM',
            'utm_zone'          => $siteData['utm_zone'],
            'datum'             => 'WGS84',
            'created_by'        => auth()->id(),
            'updated_by'        => auth()->id(),
        ]);

        foreach ($siteData['coordinates'] as $coord) {
            $site->coordinates()->create($coord);
        }

        $site->update([
            'area' => $this->buildPolygon($site->coordinates),
        ]);

        return $site->load('coordinates');
    }

    /* =====================
     | GENERATE NO_SITE
     ===================== */
    private function generateNoSite(string $name, array $coordinates): string
    {
        $code = '';

        foreach ($coordinates as $coord) {
            $e = substr((string) intval($coord['easting']), 0, 1);
            $n = substr((string) intval($coord['northing']), 0, 1);
            $code .= $e . $n;
        }

        return strtoupper($name) . ' - ' . $code;
    }

    /* =====================
     | BUILD POLYGON
     ===================== */
    private function buildPolygon($coordinates): Polygon
    {
        if ($coordinates->count() < 4 || $coordinates->count() > 6) {
            throw new \Exception('Polygon harus terdiri dari 4–6 titik');
        }

        $points = $coordinates
            ->sortBy('point_order')
            ->map(fn ($c) => Point::make($c->easting, $c->northing))
            ->values();

        $points->push($points->first());

        return Polygon::make([
            LineString::make($points->all())
        ]);
    }


    private function utmToLatLng(float $e, float $n, string $utmZone): array
    {
        // contoh "50N"
        $zone = intval(substr($utmZone, 0, -1));
        $hemisphere = substr($utmZone, -1); // N / S

        $srid = ($hemisphere === 'S')
            ? 32700 + $zone   // south
            : 32600 + $zone;  // north

        $result = DB::selectOne("
            SELECT
                ST_Y(
                    ST_Transform(
                        ST_SetSRID(ST_MakePoint(?, ?), ?),
                        4326
                    )
                ) AS lat,
                ST_X(
                    ST_Transform(
                        ST_SetSRID(ST_MakePoint(?, ?), ?),
                        4326
                    )
                ) AS lng
        ", [$e, $n, $srid, $e, $n, $srid]);

        return [
            'lat' => $result->lat,
            'lng' => $result->lng,
        ];
    }


}
