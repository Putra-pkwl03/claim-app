<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use App\Models\Claim;
use App\Models\ClaimBlock;

class ClaimController extends Controller
{
    public function index(Request $request)
    {
        $claims = Claim::with([
                'site:id,name',
                'pit:id,name,no_pit',
                'blocks',
                'blocks.block:id,name'
            ])
            ->where('contractor_id', auth()->id())
            ->orderByDesc('created_at')
            ->get();

        $formatted = $claims->map(function ($claim) {

            $totalBcmFromBlocks = $claim->blocks->sum('bcm');
            $totalBlock = $claim->blocks->count();

            return [
                'id' => $claim->id,
                'claim_number' => $claim->claim_number,
                'site' => $claim->site,
                'pit' => [
                    'id' => $claim->pit?->id,
                    'name' => $claim->pit?->name,
                    'no_pit' => $claim->pit?->no_pit,
                ],
                'period' => $claim->period_month . '/' . $claim->period_year,
                'job_type' => $claim->job_type,
                'status' => $claim->status,
                'total_bcm' => $totalBcmFromBlocks,
                'total_block' => $totalBlock,
                'total_amount' => $claim->total_amount,
                'pt_name' => $claim->pt,
                'created_at' => $claim->created_at->format('d/m/Y H:i:s'),

                'blocks' => $claim->blocks->map(function ($block) {
                    return [
                        'id' => $block->id,
                        'block_id' => $block->block_id,
                        'block_name' => $block->block->name ?? null,
                        'bcm' => $block->bcm,
                        'amount' => $block->amount,
                        'date' => optional($block->date)->format('d/m/Y'),
                        'note' => $block->note,
                        'materials' => $block->materials ?? [],
                        'file_url' => $block->file_url,
                        'file_type' => $block->file_type,
                    ];
                }),
            ];
        });

        return response()->json([
            'message' => 'Success',
            'data' => $formatted,
        ]);
    }

    public function store(Request $request)
    {
        DB::transaction(function () use ($request) {

            $claim = Claim::create([
                'claim_number' => $this->generateClaimNumber($request->pt_name),
                'pt' => $request->pt_name,
                'contractor_id' => auth()->id(),
                'site_id' => $request->site_id,
                'pit_id' => $request->pit_id,
                'period_month' => $request->period_month,
                'period_year' => $request->period_year,
                'job_type' => $request->job_type,
                'status' => 'submitted',
                'total_bcm' => 0,
                'total_amount' => 0,
            ]);

            $totalBcm = 0;
            $totalAmount = 0;

            $blocks = json_decode(json_encode($request->blocks), true);

            foreach ($blocks as $index => $block) {

                $materials = !empty($block['materials'])
                    ? array_map(fn ($m) => ['material_name' => $m['material_name']], $block['materials'])
                    : null;

                $bcm = (float) ($block['bcm'] ?? 0);
                $amount = (float) ($block['amount'] ?? 0);
                $date = !empty($block['date'])
                    ? date('Y-m-d', strtotime($block['date']))
                    : null;

                // ===== FILE UPLOAD =====
                $filePath = null;
                $fileType = null;

                if ($request->hasFile("blocks.$index.file")) {
                    $file = $request->file("blocks.$index.file");

                    $filePath = $file->store('claim-block-files', 'public');
                    $fileType = $file->getClientOriginalExtension();
                }

                ClaimBlock::create([
                    'claim_id' => $claim->id,
                    'block_id' => $block['block_id'],
                    'bcm' => $bcm,
                    'amount' => $amount,
                    'date' => $date,
                    'note' => $block['note'] ?? null,
                    'materials' => $materials,
                    'file_path' => $filePath,
                    'file_type' => $fileType,
                ]);

                $totalBcm += $bcm;
                $totalAmount += $amount;
            }

            $claim->update([
                'total_bcm' => $totalBcm,
                'total_amount' => $totalAmount,
            ]);
        });

        return response()->json(['message' => 'Claim berhasil diajukan']);
    }


    public function show($id)
    {
        $claim = Claim::with([
                'site:id,name',
                'pit:id,name,no_pit',
                'blocks',
                'blocks.block:id,name'
            ])
            ->where('id', $id)
            ->where('contractor_id', auth()->id())
            ->firstOrFail();

        $totalBcmFromBlocks = $claim->blocks->sum('bcm');
        $totalBlock = $claim->blocks->count();

        $formatted = [
            'id' => $claim->id,
            'claim_number' => $claim->claim_number,
            'site' => $claim->site,
            'pit' => [
                'id' => $claim->pit?->id,
                'name' => $claim->pit?->name,
                'no_pit' => $claim->pit?->no_pit,
            ],
            'period' => $claim->period_month . '/' . $claim->period_year,
            'job_type' => $claim->job_type,
            'status' => $claim->status,
            'total_bcm' => $totalBcmFromBlocks,
            'total_block' => $totalBlock,
             'pt_name' => $claim->pt,
            'total_amount' => $claim->total_amount,

            'blocks' => $claim->blocks->map(function ($block) {
                return [
                    'id' => $block->id,
                    'block_id' => $block->block_id,
                    'block_name' => $block->block->name ?? null,
                    'bcm' => (string) $block->bcm,
                    'amount' => (string) $block->amount,
                    'date' => $block->date ? $block->date->format('Y-m-d') : '',
                    'note' => $block->note,
                    'materials' => $block->materials ?? [],
                    'file_url' => $block->file_url,
                    'file_type' => $block->file_type,
                ];
            }),
        ];

        return response()->json([
            'message' => 'Success',
            'data' => $formatted,
        ]);
    }


    public function update(Request $request, $id)
    {
        $claim = Claim::where('id', $id)
            ->where('contractor_id', auth()->id())
            ->firstOrFail();

        DB::transaction(function () use ($request, $claim) {

            // UPDATE CLAIM UTAMA
            $claim->update([
                'site_id' => $request->site_id,
                'pit_id' => $request->pit_id,
                'claim_number' => $this->generateClaimNumber($request->pt_name),
                'period_month' => $request->period_month,
                'period_year' => $request->period_year,
                'job_type' => $request->job_type,
                'pt' => $request->pt_name
                // 'status' => 'submitted',
            ]);

            // HAPUS BLOCK LAMA + FILE
            foreach ($claim->blocks as $oldBlock) {
                if ($oldBlock->file_path) {
                    Storage::disk('public')->delete($oldBlock->file_path);
                }
            }
            $claim->blocks()->delete();

            $totalBcm = 0;
            $totalAmount = 0;

            $blocks = json_decode(json_encode($request->blocks), true);

            foreach ($blocks as $index => $block) {

                $materials = !empty($block['materials'])
                    ? array_map(fn ($m) => ['material_name' => $m['material_name']], $block['materials'])
                    : null;

                $bcm = (float) ($block['bcm'] ?? 0);
                $amount = (float) ($block['amount'] ?? 0);
                $date = !empty($block['date'])
                    ? date('Y-m-d', strtotime($block['date']))
                    : null;

                // FILE
                $filePath = null;
                $fileType = null;

                if ($request->hasFile("blocks.$index.file")) {
                    $file = $request->file("blocks.$index.file");
                    $filePath = $file->store('claim-block-files', 'public');
                    $fileType = $file->getClientOriginalExtension();
                }

                ClaimBlock::create([
                    'claim_id' => $claim->id,
                    'block_id' => $block['block_id'],
                    'bcm' => $bcm,
                    'amount' => $amount,
                    'date' => $date,
                    'note' => $block['note'] ?? null,
                    'materials' => $materials,
                    'file_path' => $filePath,
                    'file_type' => $fileType,
                ]);

                $totalBcm += $bcm;
                $totalAmount += $amount;
            }

            $claim->update([
                'total_bcm' => $totalBcm,
                'total_amount' => $totalAmount,
            ]);
        });

        return response()->json([
            'message' => 'Claim berhasil diperbarui'
        ]);
    }

    public function destroy($id)
    {
        $claim = Claim::where('id', $id)
            ->where('contractor_id', auth()->id())
            ->firstOrFail();

        DB::transaction(function () use ($claim) {

            // HAPUS FILE BLOCK
            foreach ($claim->blocks as $block) {
                if ($block->file_path) {
                    Storage::disk('public')->delete($block->file_path);
                }
            }

            // HAPUS BLOCK
            $claim->blocks()->delete();

            // HAPUS CLAIM
            $claim->delete();
        });

        return response()->json([
            'message' => 'Claim berhasil dihapus'
        ]);
    }

    private function generateClaimNumber(string $ptName): string
    {
        $year  = now()->year;
        $month = now()->month;

        // hitung jumlah claim tahun ini
        $count = Claim::whereYear('created_at', $year)->count() + 1;

        $noUrut = str_pad($count, 3, '0', STR_PAD_LEFT);

        $bulanRomawi = [
            1 => 'I', 2 => 'II', 3 => 'III', 4 => 'IV',
            5 => 'V', 6 => 'VI', 7 => 'VII', 8 => 'VIII',
            9 => 'IX', 10 => 'X', 11 => 'XI', 12 => 'XII'
        ];

        return $noUrut
            . '/PIK-SRV/'
            . strtoupper($ptName)
            . '/OB/'
            . $bulanRomawi[$month]
            . '/'
            . $year;
    }

}
