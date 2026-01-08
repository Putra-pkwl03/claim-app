<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\ClaimSignature;
use App\Models\SurveyorClaim;
use App\Models\Claim;
use Illuminate\Support\Facades\Storage;

class SignatureController extends Controller
{
    public function store(Request $request, $claimId)
    {
        $request->validate([
            'role' => 'required|in:surveyor,managerial,finance',
            'signature_base64' => 'nullable|string',
            'signature_file' => 'nullable|file|mimes:png,jpg,jpeg,pdf|max:10240',
        ]);

        $claim = SurveyorClaim::findOrFail($claimId);

        $existing = ClaimSignature::where([
            'claim_id' => $claim->id,
            'user_id' => auth()->id(),
            'role' => $request->role,
        ])->first();

        $signatureValue = null;

        /* ===== FILE UPLOAD ===== */
        if ($request->hasFile('signature_file')) {

            if ($existing && $existing->signature && str_starts_with($existing->signature, 'signatures/')) {
                Storage::disk('public')->delete($existing->signature);
            }

            $signatureValue = $request
                ->file('signature_file')
                ->store('signatures', 'public');
        }

        /* ===== BASE64 ===== */
        elseif ($request->filled('signature_base64')) {

            $base64 = explode(',', $request->signature_base64);

            if (count($base64) !== 2 || empty($base64[1])) {
                return response()->json(['message' => 'TTD kosong'], 422);
            }

            $signatureValue = $request->signature_base64;
        } else {
            return response()->json(['message' => 'TTD tidak diberikan'], 422);
        }

        $signature = ClaimSignature::updateOrCreate(
            [
                'claim_id' => $claim->id,
                'user_id' => auth()->id(),
                'role' => $request->role,
            ],
            [
                'signature' => $signatureValue,
            ]
        );

        return response()->json([
            'message' => "TTD {$request->role} berhasil disimpan",
            'data' => [
                'id' => $signature->id,
                'role' => $signature->role,
                'signature' => str_starts_with($signature->signature ?? '', 'signatures/')
                    ? asset('storage/' . $signature->signature)
                    : $signature->signature,
            ]
        ]);
    }

    public function getMySignature(Request $request, $claimId)
    {
        $request->validate([
            'role' => 'required|in:surveyor,managerial,finance,contractor',
        ]);

        $signature = ClaimSignature::where([
            'claim_id' => $claimId,
            'user_id' => auth()->id(),
            'role' => $request->role,
        ])->first();

        if (!$signature) {
            return response()->json([
                'data' => null
            ]);
        }

        return response()->json([
            'data' => [
                'id' => $signature->id,
                'role' => $signature->role,
                'signature_url' => str_starts_with($signature->signature ?? '', 'signatures/')
                    ? asset('storage/' . $signature->signature)
                    : null,
                'signature_base64' => !str_starts_with($signature->signature ?? '', 'signatures/')
                    ? $signature->signature
                    : null,
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
            ->whereIn('status', ['auto_approved', 'approved_managerial', 'approved_finance'])
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
                'contractor' => $claim->pt,
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
        // Ambil claim dari tabel claims
        $claim = Claim::with([
            'site:id,name,no_site',
            'blocks.block:id,name,pit_id',
            'blocks.block.pit:id,name,no_pit',
            'surveyorClaims' 
        ])->findOrFail($claimId);

        $surveyorClaim = $claim->surveyorClaims()
            ->with('signatures.user:id,name') 
            ->latest('created_at')
            ->first();

        // Ambil signature per role
        $signatures = $surveyorClaim?->signatures->mapWithKeys(function ($sig) {
            $signatureBase64 = null;

            if ($sig->signature) {
                if (str_starts_with($sig->signature, 'signatures/')) {
                    $path = storage_path('app/public/' . $sig->signature); // path file asli
                    if (file_exists($path)) {
                        $type = pathinfo($path, PATHINFO_EXTENSION); // jpg/png
                        $data = file_get_contents($path);
                        $signatureBase64 = 'data:image/' . $type . ';base64,' . base64_encode($data);
                    }
                } else {
                    $signatureBase64 = $sig->signature; // sudah base64
                }
            }

            return [$sig->role => [
                'user_id' => $sig->user_id,
                'user_name' => $sig->user?->name,
                'signature' => $signatureBase64
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
            $signatureBase64 = null;

            if ($s->signature) {
                // jika file ada di folder signatures/
                if (str_starts_with($s->signature, 'signatures/')) {
                    $path = storage_path('app/public/' . $s->signature);
                    if (file_exists($path)) {
                        $type = pathinfo($path, PATHINFO_EXTENSION);
                        $data = file_get_contents($path);
                        $signatureBase64 = 'data:image/' . $type . ';base64,' . base64_encode($data);
                    }
                } else {
                    $signatureBase64 = $s->signature; // sudah base64
                }
            }

            return [$s->role => [
                'user_id' => $s->user_id,
                'user_name' => $s->user?->name,
                'signature' => $signatureBase64,
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
