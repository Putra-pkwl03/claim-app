<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Claim;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index()
    {
        return response()->json([
            'users'      => $this->userOverview(),
            'claim'      => $this->claimOverview(),
            'production' => $this->productionOverview(),
        ]);
    }

    /* =====================
     | USER OVERVIEW
     ===================== */
    private function userOverview(): array
    {
        $totalUsers = User::count();

        $activeUsers = User::where('status', 'active')->count();
        $inactiveUsers = User::where('status', 'inactive')->count();

        $usersByRole = DB::table('model_has_roles')
            ->join('roles', 'roles.id', '=', 'model_has_roles.role_id')
            ->select('roles.name', DB::raw('COUNT(*) as total'))
            ->groupBy('roles.name')
            ->pluck('total', 'name');

        return [
            'total'    => $totalUsers,
            'active'   => $activeUsers,
            'inactive' => $inactiveUsers,
            'by_role'  => $usersByRole,
        ];
    }

/* =====================
 | CLAIM KPI + RELASI
 ===================== */
private function claimOverview(): array
{
    $now = now();

    /* ===== TOTAL CLAIM ===== */
    $totalClaim = Claim::count();

    $claimThisMonth = Claim::whereMonth('created_at', $now->month)
        ->whereYear('created_at', $now->year)
        ->count();

    $claimThisYear = Claim::whereYear('created_at', $now->year)->count();

    /* ===== STATUS (RAW) ===== */
    $rawStatus = Claim::select('status', DB::raw('COUNT(*) as total'))
        ->groupBy('status')
        ->pluck('total', 'status');

    $submitted = $rawStatus['submitted'] ?? 0;

    $approved =
        ($rawStatus['auto_approved'] ?? 0) +
        ($rawStatus['approved_managerial'] ?? 0) +
        ($rawStatus['approved_finance'] ?? 0);

    $rejected =
        ($rawStatus['rejected_system'] ?? 0) +
        ($rawStatus['rejected_managerial'] ?? 0) +
        ($rawStatus['rejected_finance'] ?? 0);

    /* ===== CLAIM PER SITE ===== */
    $claimBySite = Claim::with('site:id,name')
        ->select('site_id', DB::raw('COUNT(*) as total'))
        ->groupBy('site_id')
        ->get()
        ->map(fn ($c) => [
            'site_id'   => $c->site_id,
            'site_name' => $c->site?->name,
            'total'     => $c->total,
        ]);

    /* ===== CLAIM PER PIT ===== */
    $claimByPit = Claim::with('pit:id,name,no_pit')
        ->select('pit_id', DB::raw('COUNT(*) as total'))
        ->groupBy('pit_id')
        ->get()
        ->map(fn ($c) => [
            'pit_id'   => $c->pit_id,
            'pit_name' => $c->pit?->name,
            'no_pit'   => $c->pit?->no_pit,
            'total'    => $c->total,
        ]);

    /* ===== CLAIM → BLOCK ===== */
    $blockSummary = DB::table('claim_blocks')
        ->join('blocks', 'blocks.id', '=', 'claim_blocks.block_id')
        ->select(
            'blocks.id',
            'blocks.name',
            DB::raw('COUNT(DISTINCT claim_blocks.claim_id) as total_claim'),
            DB::raw('SUM(claim_blocks.bcm) as total_bcm')
        )
        ->groupBy('blocks.id', 'blocks.name')
        ->get();

    /* ===== CLAIM → SURVEYOR (INFO ONLY) ===== */
    $claimSurveyorInfo = Claim::leftJoin(
            'surveyor_claims',
            'surveyor_claims.claim_id',
            '=',
            'claims.id'
        )
        ->leftJoin(
            'users as surveyors',
            'surveyors.id',
            '=',
            'surveyor_claims.surveyor_id'
        )
        ->select(
            'claims.id as claim_id',
            'claims.claim_number',
            'surveyor_claims.id as surveyor_claim_id',
            'surveyors.id as surveyor_id',
            'surveyors.name as surveyor_name'
        )
        ->orderByDesc('claims.created_at')
        ->get();

    return [
        'total'      => $totalClaim,
        'this_month' => $claimThisMonth,
        'this_year'  => $claimThisYear,

        'by_status' => [
            'submitted' => $submitted,
            'approved'  => $approved,
            'rejected'  => $rejected,
        ],

        'by_site'  => $claimBySite,
        'by_pit'   => $claimByPit,
        'by_block' => $blockSummary,

        // 🔹 INFORMASI TAMBAHAN (SURVEYOR CLAIM)
        'claim_surveyor_info' => $claimSurveyorInfo,
    ];
}


    /* =====================
     | PRODUKSI (BCM)
     ===================== */
private function productionOverview(): array
{
    $now = now();

    $totalBcm = Claim::sum('total_bcm');

    $bcmThisMonth = Claim::whereMonth('created_at', $now->month)
        ->whereYear('created_at', $now->year)
        ->sum('total_bcm');

    $avgBcmPerClaim = Claim::avg('total_bcm');

    return [
        'total_bcm'         => (float) $totalBcm,
        'bcm_this_month'    => (float) $bcmThisMonth,
        'avg_bcm_per_claim' => round((float) $avgBcmPerClaim, 2),
    ];
}

}
