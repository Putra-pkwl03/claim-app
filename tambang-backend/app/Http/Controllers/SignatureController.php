<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\ClaimSignature;
use App\Models\SurveyorClaim;
use App\Models\Claim;

class SignatureController extends Controller
{
    /**
     * Simpan TTD untuk klaim (base64 dari canvas atau upload file)
     */
    public function store(Request $request, $claimId)
    {
        $request->validate([
            'role' => 'required|in:surveyor,managerial,finance',
            'signature_base64' => 'nullable|string',
            'signature_file' => 'nullable|file|mimes:png,jpg,jpeg,pdf|max:10240',
        ]);

        $claim = SurveyorClaim::findOrFail($claimId);

        $signatureData = null;

        if ($request->hasFile('signature_file')) {
            $file = $request->file('signature_file');
            $path = $file->store('signatures', 'public');
            $signatureData = asset('storage/' . $path);
        } elseif ($request->filled('signature_base64')) {
            $signatureData = $request->signature_base64;
        } else {
            return response()->json(['message' => 'TTD tidak diberikan'], 422);
        }

        ClaimSignature::updateOrCreate(
            [
                'claim_id' => $claim->id,
                'user_id' => auth()->id(),
                'role' => $request->role,
            ],
            [
                'signature' => $signatureData
            ]
        );

        return response()->json([
            'message' => "TTD {$request->role} berhasil disimpan",
            'data' => [
                'claim_id' => $claim->id,
                'role' => $request->role,
                'signature' => $signatureData
            ]
        ]);
    }


/**
 * Ambil claim milik contractor login dengan status auto_approved
 */
public function getContractorClaims()
{
    $userId = auth()->id(); 

    $claims = Claim::where('contractor_id', $userId)
        ->where('status', 'auto_approved')
        ->with([
            'site:id,name,no_site',
            'blocks.block:id,name,pit_id',
            'blocks.block.pit:id,name,no_pit',
        ])
        ->get();

    $data = $claims->map(function ($claim) {
        return [
            'claim_id' => $claim->id,
            'status' => $claim->status,
            'claim_number' => $claim->claim_number,
            'contractor' =>$claim->pt,
            'project' => $claim->site?->name,
            'period_month' => $claim->period_month,
            'period_year' => $claim->period_year,
            'grand_total_bcm' => $claim->blocks->sum('bcm'),
        ];
    });

    return response()->json($data);
}



public function getClaimWithSignatures($claimId)
{
    \Log::info("=== DEBUG: Claim Ditemukan ===");

    // Ambil claim dari tabel claims
    $claim = Claim::with([
        'site:id,name,no_site',
        'blocks.block:id,name,pit_id',
        'blocks.block.pit:id,name,no_pit',
        'surveyorClaims' 
    ])->findOrFail($claimId);

    \Log::info($claim->toArray());

    $surveyorClaim = $claim->surveyorClaims()
        ->with('signatures.user:id,name') 
        ->latest('created_at')
        ->first();

    if (!$surveyorClaim) {
        \Log::warning("Tidak ditemukan SurveyorClaim untuk claim ID {$claimId}");
    } else {
        \Log::info("=== DEBUG: SurveyorClaim Terbaru ===");
        \Log::info($surveyorClaim->toArray());
    }

    // Ambil signature per role
    $signatures = $surveyorClaim?->signatures->mapWithKeys(function ($sig) {
        return [$sig->role => [
            'user_id' => $sig->user_id,
            'user_name' => $sig->user?->name,
            'signature' => $sig->signature
        ]];
    }) ?? [];

    // Client PT dari SurveyorClaim
    $clientName = $surveyorClaim?->pt ?? null;

    // Contractor PT dari Claim
    $contractorName = $claim->pt;

    // Rinci volume per PIT dan block (gunakan BCM dari Claim)
    $pits = $claim->blocks
        ->groupBy(fn($b) => $b->block->pit_id)
        ->map(function ($blocks) {
            $pit = $blocks->first()->block->pit;
            $blocksData = $blocks->map(function ($b) {
                return [
                    'block_name' => $b->block->name,
                    'job_type' => $b->job_type ?? 'OB',
                    'bcm_contractor' => $b->bcm,
                    'amount_contractor' => $b->amount,
                    'date' => optional($b->date)->format('d/m/Y'),
                    'note' => $b->note,
                    'materials' => $b->materials,
                ];
            });

            return [
                'pit_name' => $pit->name,
                'pit_no' => $pit->no_pit,
                'blocks' => $blocksData,
                'total_bcm_per_pit' => $blocks->sum('bcm'),
            ];
        });

    $grandTotal = $claim->blocks->sum('bcm');

    return response()->json([
        'claim_number' => $claim->claim_number,
        'client' => $clientName,          // SurveyorClaim.pt
        'contractor' => $contractorName,   // Claim.pt
        'project' => $claim->site?->name,
        'period_month' => $claim->period_month,
        'period_year' => $claim->period_year,
        'pits' => $pits,
        'grand_total_bcm' => $grandTotal,
        'signatures' => $signatures,
    ]);
}

/**
 * Ambil detail satu claim lengkap untuk contractor login
 */
public function getContractorClaimDetail($claimId)
{
    $userId = auth()->id(); // pastikan hanya contractor sendiri yang bisa akses

    $claim = Claim::where('id', $claimId)
        ->where('contractor_id', $userId) // batasi sesuai contractor login
        ->with([
            'site:id,name,no_site',
            'blocks.block:id,name,pit_id',
            'blocks.block.pit:id,name,no_pit',
            'surveyorClaims.signatures.user', // ambil TTD
        ])
        ->firstOrFail();

    // Struktur data sesuai PDF
    $pits = $claim->blocks
        ->groupBy(fn($b) => $b->block->pit_id)
        ->map(function ($blocks) {
            $pit = $blocks->first()->block->pit;

            $blocksData = $blocks->map(function ($b) {
                return [
                    'block_name' => $b->block->name,
                    'job_type' => $b->job_type ?? 'OB',
                    'bcm_contractor' => $b->bcm,
                    'amount_contractor' => $b->amount,
                    'date' => optional($b->date)->format('d/m/Y'),
                    'note' => $b->note,
                    // Ambil material langsung dari kolom, bisa lebih dari satu pisahkan dengan koma
                    'materials' => $b->material 
                        ? array_map(fn($m) => ['material_name' => trim($m)], explode(',', $b->material)) 
                        : [],
                ];
            });

            return [
                'pit_name' => $pit->name,
                'pit_no' => $pit->no_pit,
                'blocks' => $blocksData,
                'total_bcm_per_pit' => $blocks->sum('bcm'),
            ];
        });

    $grandTotal = $claim->blocks->sum('bcm');

    // Ambil SurveyorClaim terbaru untuk client & signature
    $surveyorClaim = $claim->surveyorClaims()->latest('created_at')->first();
    $clientName = $surveyorClaim?->pt ?? null;

    $signatures = $surveyorClaim?->signatures->mapWithKeys(function ($s) {
        return [$s->role => [
            'user_id' => $s->user_id,
            'user_name' => $s->user?->name,
            'signature' => $s->signature,
        ]];
    }) ?? [];

    return response()->json([
        'claim_number' => $claim->claim_number,
        'client' => $clientName,
        'contractor' => $claim->pt,
        'project' => $claim->site?->name,
        'period_month' => $claim->period_month,
        'period_year' => $claim->period_year,
        'pits' => $pits,
        'grand_total_bcm' => $grandTotal,
        'signatures' => $signatures,
    ]);
}



}
