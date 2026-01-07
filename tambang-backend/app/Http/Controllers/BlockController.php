<?php

namespace App\Http\Controllers;

use App\Models\Block;
use Illuminate\Http\Request;

class BlockController extends Controller
{
    /**
     * List semua block
     */
    public function index()
    {
        return Block::with('pit')->get();
    }

    /**
     * Create / Update multiple blocks
     */
    public function storeOrUpdate(Request $request)
    {
        $blocks = $request->validate([
            '*.id'          => 'sometimes|exists:blocks,id',
            '*.pit_id'      => 'required|exists:pits,id',
            '*.name'        => 'required|string|max:50',
            '*.description' => 'nullable|string',
            '*.volume'      => 'nullable|numeric|min:0',
            '*.status'      => 'required|in:active,inactive',
        ]);

        $result = [];

        foreach ($blocks as $data) {

            if (!empty($data['id'])) {
                // UPDATE
                $block = Block::findOrFail($data['id']);
                $block->update([
                    'pit_id'      => $data['pit_id'],
                    'name'        => $data['name'],
                    'description' => $data['description'] ?? $block->description,
                    'volume'      => $data['volume'] ?? $block->volume,
                    'status'      => $data['status'],
                ]);
            } else {
                // CREATE
                $block = Block::create([
                    'pit_id'      => $data['pit_id'],
                    'name'        => $data['name'],
                    'description' => $data['description'] ?? null,
                    'volume'      => $data['volume'] ?? null,
                    'status'      => $data['status'],
                ]);
            }

            $result[] = $block;
        }

        return response()->json([
            'message' => 'Blocks processed',
            'data'    => $result
        ]);
    }

    /**
     * Detail block
     */
    public function show(Block $block)
    {
        return $block->load('pit');
    }

    /**
     * Hapus block
     */
    public function destroy($site, $blockId)
    {
        $block = Block::findOrFail($blockId);
        $block->delete();

        return response()->json([
            'message' => 'Block deleted permanently'
        ]);
    }

    /**
     * List block aktif per PIT
     */
    public function blocksByPit($pitId)
    {
        return Block::where('pit_id', $pitId)
            ->where('status', 'active')
            ->orderBy('name')
            ->get();
    }
}
