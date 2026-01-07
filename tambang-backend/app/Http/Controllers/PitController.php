<?php

namespace App\Http\Controllers;

use App\Models\Pit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Clickbar\Magellan\Data\Geometries\Polygon;
use Clickbar\Magellan\Data\Geometries\LineString;
use Clickbar\Magellan\Data\Geometries\Point;
use App\Models\Site;


class PitController extends Controller
{
    /* =====================
     | LIST PIT BY SITE
     ===================== */
public function index($siteId)
{
    return Pit::with(['coordinates', 'blocks']) 
        ->where('site_id', $siteId)
        ->get()
        ->map(function ($pit) {

            $luas = DB::table('pits')
                ->where('id', $pit->id)
                ->selectRaw('ST_Area(area)')
                ->value('st_area');

            $latlng = $pit->coordinates
                ->sortBy('point_order')
                ->map(fn ($c) =>
                    $this->utmToLatLng(
                        (float) $c->easting,
                        (float) $c->northing,
                        $pit->utm_zone
                    )
                )
                ->values();

            return [
                'id'          => $pit->id,
                'site_id'     => $pit->site_id,
                'no_pit'      => $pit->no_pit,
                'name'        => $pit->name,
                'description' => $pit->description,
                'status_aktif'=> $pit->status_aktif,
                'luas_m2'     => $luas,

                'blocks'      => $pit->blocks, 

                'coordinates' => $pit->coordinates,
                'coordinates_latlng' => $latlng,
            ];
        });
}


    /* =====================
     | CREATE PIT (BULK)
     ===================== */
    public function store(Request $request)
    {
        $data = $request->validate([
            'site_id' => 'required|exists:sites,id',

            'pits' => 'required|array|min:1',
            'pits.*.name' => 'required|string|max:50',
            'pits.*.description' => 'nullable|string',
            'pits.*.utm_zone' => 'required|string|max:10',
            // 'pits.*.jenis_material' => 'nullable|string|max:50',
            'pits.*.status_aktif' => 'nullable|boolean',

            'pits.*.coordinates' => 'required|array|min:4|max:6',
            'pits.*.coordinates.*.point_order' => 'required|integer',
            'pits.*.coordinates.*.easting' => 'required|numeric',
            'pits.*.coordinates.*.northing' => 'required|numeric',
            'pits.*.coordinates.*.elevation' => 'nullable|numeric',
        ]);

        return DB::transaction(function () use ($data) {

            $result = [];

            foreach ($data['pits'] as $pitData) {

                $noPit = $this->generateNoPit(
                    $pitData['name'],
                    $pitData['coordinates']
                );

                $pit = Pit::create([
                    'site_id' => $data['site_id'],
                    'no_pit'  => $noPit,
                    'name'    => $pitData['name'],
                    'description' => $pitData['description'] ?? null,
                    // 'jenis_material' => $pitData['jenis_material'] ?? null,
                    'status_aktif' => $pitData['status_aktif'] ?? true,

                    'coordinate_system' => 'UTM',
                    'utm_zone' => $pitData['utm_zone'],
                    'datum' => 'WGS84',

                    'created_by' => auth()->id(),
                    'updated_by' => auth()->id(),
                ]);

                foreach ($pitData['coordinates'] as $coord) {
                    $pit->coordinates()->create([
                        'point_order' => $coord['point_order'],
                        'point_code'  => 'P' . $coord['point_order'],
                        'easting'     => $coord['easting'],
                        'northing'    => $coord['northing'],
                        'elevation'   => $coord['elevation'] ?? null,
                    ]);
                }

                $pit->update([
                    'area' => $this->buildPolygon($pit->coordinates),
                ]);

                $result[] = $pit->load('coordinates');
            }

            return response()->json($result, 201);
        });
    }

    /* =====================
     | SHOW PIT
     ===================== */

public function show(Site $site, Pit $pit)
{
    abort_if($pit->site_id !== $site->id, 404);

    $pit->load(['blocks', 'coordinates']);

    $luas = DB::table('pits')
        ->where('id', $pit->id)
        ->selectRaw('ST_Area(area)')
        ->value('st_area');

    $latlng = $pit->coordinates
        ->sortBy('point_order')
        ->map(fn ($c) =>
            $this->utmToLatLng(
                (float) $c->easting,
                (float) $c->northing,
                $pit->utm_zone
            )
        )
        ->values();

    return response()->json([
        'id' => $pit->id,
        'site_id' => $pit->site_id,
        'no_pit' => $pit->no_pit,
        'name' => $pit->name,
        'description' => $pit->description,
        'status_aktif' => $pit->status_aktif,
        'luas_m2' => $luas,
        'blocks' => $pit->blocks,
        'coordinates' => $pit->coordinates,
        'coordinates_latlng' => $latlng,
    ]);
}


/* =====================
 | UPSERT PIT (UPDATE + CREATE)
 ===================== */
public function update(Request $request)
{
    $data = $request->validate([
        'site_id' => 'required|exists:sites,id',

        'pits' => 'required|array|min:1',
        'pits.*.id' => 'sometimes|exists:pits,id',

        'pits.*.name' => 'required|string|max:50',
        'pits.*.description' => 'nullable|string',
        'pits.*.utm_zone' => 'required|string|max:10',
        'pits.*.status_aktif' => 'nullable|boolean',

        'pits.*.coordinates' => 'required|array|min:4|max:6',
        'pits.*.coordinates.*.point_order' => 'required|integer',
        'pits.*.coordinates.*.easting' => 'required|numeric',
        'pits.*.coordinates.*.northing' => 'required|numeric',
        'pits.*.coordinates.*.elevation' => 'nullable|numeric',
    ]);

    return DB::transaction(function () use ($data) {

        $result = [];

        foreach ($data['pits'] as $pitData) {

            /** =====================
             * UPDATE
             ===================== */
            if (!empty($pitData['id'])) {

                $pit = Pit::findOrFail($pitData['id']);

                $pit->update([
                    'name' => $pitData['name'],
                    'description' => $pitData['description'] ?? $pit->description,
                    'utm_zone' => $pitData['utm_zone'],
                    'status_aktif' => $pitData['status_aktif'] ?? $pit->status_aktif,
                    'updated_by' => auth()->id(),
                ]);

                // replace coordinates
                $pit->coordinates()->delete();

            /** =====================
             * CREATE
             ===================== */
            } else {

                $noPit = $this->generateNoPit(
                    $pitData['name'],
                    $pitData['coordinates']
                );

                $pit = Pit::create([
                    'site_id' => $data['site_id'],
                    'no_pit' => $noPit,
                    'name' => $pitData['name'],
                    'description' => $pitData['description'] ?? null,
                    'utm_zone' => $pitData['utm_zone'],
                    'status_aktif' => $pitData['status_aktif'] ?? true,

                    'coordinate_system' => 'UTM',
                    'datum' => 'WGS84',

                    'created_by' => auth()->id(),
                    'updated_by' => auth()->id(),
                ]);
            }

            /** =====================
             * COORDINATES
             ===================== */
            foreach ($pitData['coordinates'] as $coord) {
                $pit->coordinates()->create([
                    'point_order' => $coord['point_order'],
                    'point_code' => 'P' . $coord['point_order'],
                    'easting' => $coord['easting'],
                    'northing' => $coord['northing'],
                    'elevation' => $coord['elevation'] ?? null,
                ]);
            }

            // rebuild polygon
            $pit->update([
                'area' => $this->buildPolygon($pit->coordinates),
            ]);

            $result[] = $pit->load('coordinates');
        }

        return response()->json($result, 200);
    });
}



    /* =====================
     | UPDATE PIT
     ===================== */
    // public function update(Request $request)
    // {
    //     $data = $request->validate([
    //         'pits' => 'required|array|min:1',
    //         'pits.*.id' => 'required|exists:pits,id',
    //         'pits.*.name' => 'sometimes|string|max:50',
    //         'pits.*.description' => 'nullable|string',
    //         'pits.*.utm_zone' => 'sometimes|string|max:10',
    //         // 'pits.*.jenis_material' => 'nullable|string|max:50',
    //         'pits.*.status_aktif' => 'nullable|boolean',

    //         'pits.*.coordinates' => 'nullable|array|min:4|max:6',
    //         'pits.*.coordinates.*.point_order' => 'required_with:pits.*.coordinates|integer',
    //         'pits.*.coordinates.*.easting' => 'required_with:pits.*.coordinates|numeric',
    //         'pits.*.coordinates.*.northing' => 'required_with:pits.*.coordinates|numeric',
    //     ]);

    //     return DB::transaction(function () use ($data) {

    //         $updated = [];

    //         foreach ($data['pits'] as $pitData) {

    //             $pit = Pit::findOrFail($pitData['id']);

    //             $pit->update([
    //                 'name' => $pitData['name'] ?? $pit->name,
    //                 'description' => $pitData['description'] ?? $pit->description,
    //                 'utm_zone' => $pitData['utm_zone'] ?? $pit->utm_zone,
    //                 // 'jenis_material' => $pitData['jenis_material'] ?? $pit->jenis_material,
    //                 'status_aktif' => $pitData['status_aktif'] ?? $pit->status_aktif,
    //                 'updated_by' => auth()->id(),
    //             ]);

    //             if (isset($pitData['coordinates'])) {
    //                 $pit->coordinates()->delete();

    //                 foreach ($pitData['coordinates'] as $coord) {
    //                     $pit->coordinates()->create([
    //                         'point_order' => $coord['point_order'],
    //                         'point_code'  => 'P' . $coord['point_order'],
    //                         'easting'     => $coord['easting'],
    //                         'northing'    => $coord['northing'],
    //                     ]);
    //                 }

    //                 $pit->update([
    //                     'area' => $this->buildPolygon($pit->coordinates),
    //                 ]);
    //             }

    //             $updated[] = $pit->load('coordinates');
    //         }

    //         return response()->json($updated, 200);
    //     });
    // }

    /* =====================
     | DELETE
     ===================== */
    public function destroy(Site $site, Pit $pit)
    {
        abort_if($pit->site_id !== $site->id, 404);

        $pit->delete();

        return response()->json(['message' => 'PIT deleted']);
    }


    /* =====================
     | HELPERS
     ===================== */
    private function generateNoPit(string $name, array $coordinates): string
    {
        $code = '';

        $coords = collect($coordinates)->sortBy('point_order');

        foreach ($coords as $coord) {
            $e = substr((string) intval($coord['easting']), 0, 1);
            $n = substr((string) intval($coord['northing']), 0, 1);
            $code .= $e . $n;
        }
        return strtoupper($name) . ' - ' . $code;
    }


    private function buildPolygon($coordinates): Polygon
    {
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
        $zone = intval(substr($utmZone, 0, -1));
        $hemisphere = substr($utmZone, -1);

        $srid = ($hemisphere === 'S')
            ? 32700 + $zone
            : 32600 + $zone;

        $result = DB::selectOne("
            SELECT
                ST_Y(ST_Transform(ST_SetSRID(ST_MakePoint(?, ?), ?), 4326)) AS lat,
                ST_X(ST_Transform(ST_SetSRID(ST_MakePoint(?, ?), ?), 4326)) AS lng
        ", [$e, $n, $srid, $e, $n, $srid]);

        return [
            'lat' => $result->lat,
            'lng' => $result->lng,
        ];
    }
}
