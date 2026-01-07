<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Threshold;
use Illuminate\Support\Facades\Validator;

class ThresholdController extends Controller
{
    /**
     * Daftar semua threshold
     */
    public function index()
    {
        $thresholds = Threshold::orderByDesc('created_at')->get();
        return response()->json([
            'message' => 'Success',
            'data' => $thresholds
        ]);
    }

    /**
     * Ambil threshold aktif
     */
    public function active()
    {
        $threshold = Threshold::where('active', true)->first();
        return response()->json([
            'message' => 'Success',
            'data' => $threshold
        ]);
    }

    /**
     * Buat threshold baru
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|unique:thresholds,name',
            'limit_value' => 'required|numeric|min:0',
            'description' => 'nullable|string',
            'active' => 'boolean'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        // Jika active = true, matikan threshold aktif lainnya
        if (!empty($request->active) && $request->active) {
            Threshold::where('active', true)->update(['active' => false]);
        }

        $threshold = Threshold::create($validator->validated());

        return response()->json([
            'message' => 'Threshold berhasil dibuat',
            'data' => $threshold
        ]);
    }

    /**
     * Update threshold
     */
    public function update(Request $request, $id)
    {
        $threshold = Threshold::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'name' => 'required|unique:thresholds,name,' . $threshold->id,
            'limit_value' => 'required|numeric|min:0',
            'description' => 'nullable|string',
            'active' => 'boolean'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        if (!empty($request->active) && $request->active) {
            Threshold::where('active', true)->where('id', '!=', $threshold->id)->update(['active' => false]);
        }

        $threshold->update($validator->validated());

        return response()->json([
            'message' => 'Threshold berhasil diupdate',
            'data' => $threshold
        ]);
    }

    /**
     * Hapus threshold
     */
    public function destroy($id)
    {
        $threshold = Threshold::findOrFail($id);
        $threshold->delete();

        return response()->json([
            'message' => 'Threshold berhasil dihapus'
        ]);
    }


    /**
 * Update status aktif threshold (PATCH)
 */
public function patchStatus(Request $request, $id)
{
    $validator = Validator::make($request->all(), [
        'active' => 'required|boolean'
    ]);

    if ($validator->fails()) {
        return response()->json([
            'message' => 'Validation failed',
            'errors' => $validator->errors()
        ], 422);
    }

    $threshold = Threshold::findOrFail($id);

    // Jika mau mengaktifkan → nonaktifkan yang lain
    if ($request->active) {
        Threshold::where('active', true)
            ->where('id', '!=', $threshold->id)
            ->update(['active' => false]);
    }

    $threshold->update([
        'active' => $request->active
    ]);

    return response()->json([
        'message' => 'Status threshold berhasil diubah',
        'data' => $threshold
    ]);
}

}
