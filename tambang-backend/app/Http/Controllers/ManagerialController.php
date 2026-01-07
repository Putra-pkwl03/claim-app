<?php

namespace App\Http\Controllers;

use App\Models\Claim;
use App\Models\Threshold;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ManagerialController extends Controller
{
    public function index()
    {
        $claims = Claim::with([
            'site:id,name,no_site',
            'pit:id,name,no_pit',
            'contractor:id,name',
            'blocks.block:id,name',
            'blocks.surveyorBlock.surveyorClaim.surveyor:id,name',
        ])->get();

        $activeThreshold = Threshold::activeThreshold();

        $data = $claims->map(function ($claim) use ($activeThreshold) {

            // 1 claim = 1 surveyor claim (ambil dari salah satu block)
            $surveyorClaim = $claim->blocks
                ->pluck('surveyorBlock.surveyorClaim')
                ->filter()
                ->first();

            return [
                'id' => $claim->id,
                'surveyor_claim_id' =>$surveyorClaim,
                'claim_number' => $claim->claim_number,

                /* ===== SITE ===== */
                'site' => [
                    'id'   => $claim->site?->id,
                    'no'   => $claim->site?->no_site,
                    'name' => $claim->site?->name,
                ],

                /* ===== PIT ===== */
                'pit' => [
                    'id'   => $claim->pit?->id,
                    'no'   => $claim->pit?->no_pit,
                    'name' => $claim->pit?->name,
                ],

                'period_month' => $claim->period_month,
                'period_year'  => $claim->period_year,
                'job_type'     => $claim->job_type,
                'status'       => $claim->status,

                /* ===== CONTRACTOR (CLAIM LEVEL) ===== */
                'contractor_name'         => $claim->contractor?->name,
                'total_bcm_contractor'    => $claim->total_bcm,
                'total_amount_contractor' => $claim->total_amount,
                'status_contractor_claim' => $claim->status,

                /* ===== SURVEYOR (CLAIM LEVEL) ===== */
                'surveyor_name'         => $surveyorClaim?->surveyor?->name,
                'total_bcm_surveyor'    => $surveyorClaim?->total_bcm,
                'total_amount_surveyor' => $surveyorClaim?->total_amount,
                'status_surveyor_claim' => $surveyorClaim?->status,

                /* ===== BLOCK DETAIL ===== */
                'blocks' => $claim->blocks->map(function ($b) use ($activeThreshold) {

                    $sb = $b->surveyorBlock;

                    $contractorBcm = (float) $b->bcm;
                    $surveyorBcm   = (float) ($sb?->bcm ?? 0);

                    $selisihBcm = $sb
                        ? abs($surveyorBcm - $contractorBcm)
                        : null;

                    $selisihPersen = ($sb && $contractorBcm > 0)
                        ? round(($selisihBcm / $contractorBcm) * 100, 2)
                        : null;

                    $withinThreshold = ($sb && $activeThreshold)
                        ? $selisihBcm <= $activeThreshold->limit_value
                        : null;

                    return [
                        'block_id'   => $b->block_id,
                        'block_name' => $b->block?->name,

                        /* --- CONTRACTOR BLOCK --- */
                        'contractor' => [
                            'bcm'       => $b->bcm,
                            'amount'    => $b->amount,
                            'date'      => $b->date?->format('d/m/Y'),
                            'note'      => $b->note,
                            'materials' => $b->materials,
                            'file'      => $b->file_url,
                        ],

                        /* --- SURVEYOR BLOCK --- */
                        'surveyor' => $sb ? [
                            'bcm'       => $sb->bcm,
                            'amount'    => $sb->amount,
                            'date'      => $sb->date?->format('d/m/Y'),
                            'note'      => $sb->note,
                            'materials' => $sb->materials,
                            'file'      => $sb->file_path
                                ? asset('storage/' . $sb->file_path)
                                : null,
                        ] : null,

                        /* ===== SELISIH & THRESHOLD ===== */
                        'selisih_bcm'        => $selisihBcm,
                        'selisih_persen'     => $selisihPersen,
                        'within_threshold'   => $withinThreshold,
                        'threshold_limit'    => $activeThreshold?->limit_value,
                
                        'is_surveyed' => $sb !== null,
                    ];
                }),
            ];
        });

        return response()->json([
            'message' => 'Success',
            'data'    => $data
        ]);
    }

      // PATCH /managerial/claims/{id}/status
    public function updateStatus(Request $request, $id)
    {
        // Validasi input
        $validator = Validator::make($request->all(), [
            'status' => 'required|in:approved_managerial,rejected_managerial',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Invalid status',
                'errors'  => $validator->errors(),
            ], 422);
        }

        $claim = Claim::find($id);

        if (!$claim) {
            return response()->json([
                'message' => 'Claim not found',
            ], 404);
        }

        // Hanya update claim level contractor
        $claim->status = $request->status;
        $claim->save();

        return response()->json([
            'message' => 'Status updated successfully',
            'data'    => [
                'id'     => $claim->id,
                'status' => $claim->status,
            ],
        ]);
    }
}
