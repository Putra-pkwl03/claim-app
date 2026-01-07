<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\SurveyorClaim;
use App\Models\SurveyorClaimBlock;
use App\Models\Claim;
use App\Models\ClaimBlock;


class SurveyorClaimController extends Controller
{
    /**
     * LIST SURVEYOR CLAIM
     */
    public function index(Request $request)
    {
        $claims = SurveyorClaim::with([
                'site:id,name,no_site',
                'pit:id,name,no_pit',
                'blocks.block:id,name',
                'blocks.claimBlock:id,claim_id,bcm,date,materials,file_path,file_type,note,amount',
            ])
            ->where('surveyor_id', auth()->id())
            ->orderByDesc('created_at')
            ->get();

        return response()->json([
            'message' => 'Success',
            'data' => $claims->map(function ($claim) {

                $totalBlock = $claim->blocks->count();
                $surveyedBlock = $claim->blocks
                    ->filter(fn ($b) => $b->claimBlock !== null)
                    ->count();

                return [
                    'id' => $claim->id,
                    'claim_number' => $claim->claim_number,

                    // site & pit
                    'no_site'   => $claim->site?->no_site,
                    'site_name' => $claim->site?->name,
                    'no_pit'    => $claim->pit?->no_pit,
                    'pit_name'  => $claim->pit?->name,

                    // period
                    'period_month' => $claim->period_month,
                    'period_year'  => $claim->period_year,
                    'job_type'     => $claim->job_type,
                    'status'       => $claim->status,

                    // summary
                    'total_block'        => $totalBlock,
                    'surveyed_block'     => $surveyedBlock,
                    'not_surveyed_block' => $totalBlock - $surveyedBlock,
                    'total_bcm'          => $claim->total_bcm,
                    'pt_name'          => $claim->pt,
                    'total_amount'       => $claim->total_amount,

                    // blocks
                    'blocks' => $claim->blocks->map(function ($b) {
                        return [
                            'claim_block_id' => $b->id,
                            'block_id'       => $b->block?->id,
                            'block_name'     => $b->block?->name,

                            // BCM
                            'bcm_surveyor'   => $b->bcm,
                            'bcm_contractor' => $b->claimBlock?->bcm,

                            // DATE
                            'date_surveyor'   => $b->date?->format('d/m/Y'),
                            'date_contractor' => $b->claimBlock?->date?->format('d/m/Y'),

                            // NOTE
                            'note_surveyor'   => $b->note,
                            'note_contractor' => $b->claimBlock
                            ? $b->claimBlock->note
                            : null,

                            // MATERIAL
                            'materials_surveyor'   => $b->materials,
                            'materials_contractor' => $b->claimBlock?->materials,

                            // FILE
                            'file_surveyor' => $b->file_path
                                ? asset('storage/' . $b->file_path)
                                : null,

                            'file_contractor' => $b->claimBlock
                                ? $b->claimBlock->file_url
                                : null,

                            'file_type_surveyor'   => $b->file_type,
                            'file_type_contractor' => $b->claimBlock?->file_type,

                            'amount_surveyor' => $b->amount,
                            'amount_contractor' => $b->claimBlock
                            ? $b->claimBlock->amount
                            : null,

                            'is_surveyed' => $b->claimBlock !== null,
                        ];
                    }),
                ];
            }),
        ]);
    }

    /**
     * LIST CLAIM CONTRACTOR UNTUK SURVEYOR (DETAIL STYLE)
     */
    public function indexForSurveyor()
    {
        $claims = Claim::with([
            'contractor:id,name',
            'site:id,name,no_site',
            'pit:id,name,no_pit',
            'blocks.block:id,name',
            'blocks.surveyorBlock:id,claim_block_id',
        ])
        ->orderByDesc('created_at')
        ->get();

        return response()->json([
            'message' => 'Success',
            'data' => $claims->map(function ($claim) {

                $totalBlock = $claim->blocks->count();

                $surveyedBlock = $claim->blocks->filter(
                    fn ($b) => $b->surveyorBlock !== null
                )->count();

                return [
                    'id' => $claim->id,
                    'claim_number' => $claim->claim_number,

                    // contractor
                    'contractor_id' => $claim->contractor?->id,
                    'contractor_name' => $claim->contractor?->name,

                    // site
                    'no_site'   => $claim->site?->no_site,
                    'site_name' => $claim->site?->name,

                    // pit
                    'no_pit'    => $claim->pit?->no_pit,
                    'pit_name'  => $claim->pit?->name,

                    'period_month' => $claim->period_month,
                    'period_year' => $claim->period_year,
                    'job_type' => $claim->job_type,
                    'pt_name' => $claim->pt,
                    'status' => $claim->status,

                    // summary
                    'total_block' => $totalBlock,
                    'surveyed_block' => $surveyedBlock,
                    'not_surveyed_block' => $totalBlock - $surveyedBlock,

                    'total_bcm' => $claim->total_bcm,
                    'total_amount' => $claim->total_amount,

                    // blocks
                    'blocks' => $claim->blocks->map(fn ($b) => [
                        'claim_block_id' => $b->id,
                        'block_id' => $b->block?->id,
                        'block_name' => $b->block?->name,
                        'bcm_contractor' => $b->bcm,
                        'amount' => $b->amount,
                        'date' => $b->date?->format('d/m/Y'),
                        'note' => $b->note,
                        'materials' => $b->materials,
                        'file_url' => $b->file_url,
                        'file_type' => $b->file_type,
                        'is_surveyed' => $b->surveyorBlock !== null,
                    ]),
                ];
            })
        ]);
    }


    /**
     * DETAIL SURVEYOR CLAIM (UNTUK EDIT)
     */
    public function show($id)
    {
        $claim = SurveyorClaim::with([
            'site:id,name',
            'pit:id,name',
            'blocks.block:id,name',
        ])
        ->where('surveyor_id', auth()->id())
        ->findOrFail($id);

        return response()->json([
            'message' => 'Success',
            'data' => [
                'id' => $claim->id,
                'site_id' => $claim->site_id,
                'pit_id' => $claim->pit_id,
                'site_name' => $claim->site?->name,
                'pit_name' => $claim->pit?->name,
                'period_month' => $claim->period_month,
                'period_year' => $claim->period_year,
                'job_type' => $claim->job_type,
                'total_bcm' => $claim->total_bcm,
                'pt_name' => $claim->pt_name,

                'total_amount' => $claim->total_amount,
                'blocks' => $claim->blocks->map(fn ($b) => [
                    'surveyor_claim_block_id' => $b->id,
                    'block_id' => $b->block_id,
                    'block_name' => $b->block?->name,
                    'bcm' => $b->bcm,
                    'amount' => $b->amount,
                    'date' => optional($b->date)->format('d/m/Y'),
                    'note' => $b->note,
                    'materials' => $b->materials ?? [],
                ]),
            ]
        ]);
    }

    /**
     * GET DETAIL CLAIM CONTRACTOR UNTUK SURVEYOR
     */
    public function showForSurveyor($id)
    {
        $claim = Claim::with([
            'site:id,name',
            'pit:id,name',
            'blocks.block:id,name',
        ])->findOrFail($id);

        return response()->json([
            'message' => 'Success',
            'data' => [
                'id' => $claim->id,
                'claim_number' => $claim->claim_number,
                'site' => $claim->site,
                'pit' => $claim->pit,
                'period_month' => $claim->period_month,
                'period_year' => $claim->period_year,
                'job_type' => $claim->job_type,
                'status' => $claim->status,
                'total_bcm' => $claim->total_bcm,
                'total_amount' => $claim->total_amount, 
                'pt_name' => $claim->pt,           
                'blocks' => $claim->blocks->map(fn ($b) => [
                    'claim_block_id' => $b->id,
                    'block_id' => $b->block?->id,
                    'block_name' => $b->block?->name,
                    'bcm_contractor' => $b->bcm,
                    'amount' => $b->amount,
                    'date' => $b->date?->format('d/m/Y'),
                    'note' => $b->note,
                    'materials' => $b->materials,
                    'file_url' => $b->file_path ? asset("storage/{$b->file_path}") : null,
                    'file_type' => $b->file_type,
                    'is_surveyed' => $b->is_surveyed ?? false,
                ]),
            ]
        ]);
    }


public function store(Request $request)
{
    DB::transaction(function () use ($request) {

        // Ambil claim_id dari salah satu block yang dikirim
        $firstClaimBlock = ClaimBlock::find($request->blocks[0]['claim_block_id'] ?? null);
        if (!$firstClaimBlock) {
            throw new \Exception("Claim block tidak ditemukan");
        }
        $claimId = $firstClaimBlock->claim_id;

        // =================== CREATE SURVEYOR CLAIM ===================
        $surveyorClaim = SurveyorClaim::create([
            'claim_id'     => $claimId, // <-- pastikan claim_id terisi
            'claim_number' => 'PIK-SRV/' . time(),
            'pt'           => $request->pt_name,
            'surveyor_id'  => auth()->id(),
            'site_id'      => $request->site_id,
            'pit_id'       => $request->pit_id,
            'period_month' => $request->period_month,
            'period_year'  => $request->period_year,
            'job_type'     => $request->job_type,
            'status'       => 'submitted',
            'total_bcm'    => 0,
            'total_amount' => 0,
        ]);

        $totalBcm = 0;
        $totalAmount = 0;

        // =================== SAVE BLOCKS ===================
        foreach ($request->blocks as $i => $block) {

            $filePath = null;
            $fileType = null;
            if ($request->hasFile("blocks.$i.file")) {
                $file = $request->file("blocks.$i.file");
                $fileType = str_contains($file->getMimeType(), 'pdf') ? 'pdf' : 'image';
                $filePath = $file->store('surveyor-claims/blocks', 'public');
            }

            $scBlock = SurveyorClaimBlock::create([
                'surveyor_claim_id' => $surveyorClaim->id,
                'claim_block_id'    => $block['claim_block_id'],
                'block_id'          => $block['block_id'],
                'bcm'               => (float) $block['bcm'],
                'amount'            => (float) ($block['amount'] ?? 0),
                'date'              => $block['date'] ?? null,
                'note'              => $block['note'] ?? null,
                'materials'         => $block['materials'] ?? null,
                'file_path'         => $filePath,
                'file_type'         => $fileType,
                'is_surveyed'       => true,
            ]);

            $totalBcm += $scBlock->bcm;
            $totalAmount += $scBlock->amount;
        }

        // =================== UPDATE TOTAL SURVEYOR CLAIM ===================
        $surveyorClaim->update([
            'total_bcm'    => $totalBcm,
            'total_amount' => $totalAmount,
            'status'       => 'validated',
        ]);

        // =================== AUTO APPROVE / REJECT TOTAL CLAIM ===================
        if ($surveyorClaim->checkAutoApproveTotal()) {
            $firstClaimBlock->claim->update(['status' => 'auto_approved']);
        } else {
            $firstClaimBlock->claim->update(['status' => 'rejected_system']);
        }

    });

    return response()->json([
        'message' => 'Surveyor claim berhasil diajukan'
    ]);
}

    /**
 * UPDATE / EDIT SURVEYOR CLAIM
 */
    public function update(Request $request, $id)
    {
        DB::transaction(function () use ($request, $id) {

            $claim = SurveyorClaim::with('blocks')->findOrFail($id);

            // update header claim
            $claim->update([
                'site_id'      => $request->site_id,
                'pit_id'       => $request->pit_id,
                'period_month' => $request->period_month,
                'period_year'  => $request->period_year,
                'job_type'     => $request->job_type,
                'pt' => $request->pt_name,
            ]);

            $totalBcm = 0;
            $totalAmount = 0;

            foreach ($request->blocks as $i => $block) {

                $scBlock = SurveyorClaimBlock::where('id', $block['surveyor_claim_block_id'])
                    ->where('surveyor_claim_id', $claim->id)
                    ->firstOrFail();

                /* FILE */
                $filePath = $scBlock->file_path;
                $fileType = $scBlock->file_type;

                if ($request->hasFile("blocks.$i.file")) {

                    // hapus file lama
                    if ($filePath && \Storage::disk('public')->exists($filePath)) {
                        \Storage::disk('public')->delete($filePath);
                    }

                    $file = $request->file("blocks.$i.file");
                    $fileType = str_contains($file->getMimeType(), 'pdf') ? 'pdf' : 'image';
                    $filePath = $file->store('surveyor-claims/blocks', 'public');
                }

                /* UPDATE BLOCK */
                $scBlock->update([
                    'bcm'       => (float) $block['bcm'],
                    'amount'    => (float) ($block['amount'] ?? 0),
                    'date'      => $block['date'] ?? null,
                    'note'      => $block['note'] ?? null,
                    'materials' => $block['materials'] ?? null,
                    'file_path' => $filePath,
                    'file_type' => $fileType,
                ]);

                $totalBcm += $scBlock->bcm;
                $totalAmount += $scBlock->amount;
            }

            /* UPDATE TOTAL */
            $claim->update([
                'total_bcm'    => $totalBcm,
                'total_amount' => $totalAmount,
            ]);
        });

        return response()->json([
            'message' => 'Surveyor claim berhasil diperbarui'
        ]);
    }


    /**
 * DELETE SURVEYOR CLAIM
 */
    public function destroy($id)
    {
        $claim = SurveyorClaim::with('blocks')->findOrFail($id);

        // Hapus file yang tersimpan di storage (jika ada)
        foreach ($claim->blocks as $block) {
            if ($block->file_path) {
                $file = str_replace(asset('storage/'), '', $block->file_path);
                if (\Storage::disk('public')->exists($file)) {
                    \Storage::disk('public')->delete($file);
                }
            }
        }

        // Hapus blok terkait
        $claim->blocks()->delete();

        // Hapus claim
        $claim->delete();

        return response()->json([
            'message' => 'Surveyor claim berhasil dihapus'
        ]);
    }

}
