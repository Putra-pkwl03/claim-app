<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserManagementController;
use App\Http\Controllers\ClaimController;
use App\Http\Controllers\ClaimLimitController;
use App\Http\Controllers\SiteController;
use App\Http\Controllers\PitController;
use App\Http\Controllers\BlockController;
use App\Http\Controllers\SurveyorClaimController;
use App\Http\Controllers\ThresholdController;
use App\Http\Controllers\ManagerialController;
use App\Http\Controllers\FinanceController;
use App\Http\Controllers\SignatureController;
use App\Http\Controllers\DashboardController;

// ===============================
// AUTH ROUTES
// ===============================
Route::post('auth/login', [AuthController::class, 'login']);
Route::post('auth/refresh', [AuthController::class, 'refreshToken']);
Route::post('auth/logout', [AuthController::class, 'logout'])->middleware('jwt.cookie');
Route::middleware(['jwt.cookie'])->get('/auth/me', [AuthController::class, 'me']);
Route::middleware(['jwt.cookie', 'check.status'])->put('/auth/update-profile', [AuthController::class, 'updateProfile']);

// ===============================
// USER MANAGEMENT ROUTES (ADMIN ONLY)
// ===============================
Route::middleware(['jwt.cookie', 'role:admin', 'check.status'])->prefix('users')->group(function () {
    Route::post('/create', [UserManagementController::class, 'createUser']);
    Route::get('/', [UserManagementController::class, 'getUsers']);
    Route::post('/update/{id}', [UserManagementController::class, 'updateUser']);
    Route::delete('/delete/{id}', [UserManagementController::class, 'deleteUser']);
});

// ===============================
// THRESHOLD ROUTE (ADMIN ONLY)
// ===============================
Route::middleware(['jwt.cookie','role:admin'])->prefix('thresholds')->group(function () {
    Route::get('/', [ThresholdController::class, 'index']);
    Route::get('/active', [ThresholdController::class, 'active']);
    Route::post('/', [ThresholdController::class, 'store']);
    Route::put('/{id}', [ThresholdController::class, 'update']);
    Route::patch('/{id}/status', [ThresholdController::class, 'patchStatus']);
    Route::delete('/{id}', [ThresholdController::class, 'destroy']);
});


// CONTRACTOR
Route::middleware(['jwt.cookie','role:contractor'])
    ->prefix('contractor/claims')
    ->group(function () {
        Route::get('/', [ClaimController::class, 'index']);
        Route::post('/', [ClaimController::class, 'store']);
        Route::get('/{id}', [ClaimController::class, 'show']);
        Route::put('/{id}', [ClaimController::class, 'update']);
        Route::delete('/{id}', [ClaimController::class, 'destroy']);
    });

// SURVEYOR
Route::middleware(['jwt.cookie','role:surveyor'])
    ->prefix('surveyor/claims')
    ->group(function () {
        Route::get('/', [SurveyorClaimController::class, 'index']);
        Route::get('/{id}', [SurveyorClaimController::class, 'show']);
        Route::post('/', [SurveyorClaimController::class, 'store']);
        Route::put('/{id}', [SurveyorClaimController::class, 'update']);
        Route::delete('/{id}', [SurveyorClaimController::class, 'destroy']); 
    });


    // SURVEYOR - VIEW CONTRACTOR CLAIMS
Route::middleware(['jwt.cookie','role:surveyor'])
    ->prefix('surveyor/contractor-claims')
    ->group(function () {
        Route::get('/', [SurveyorClaimController::class, 'indexForSurveyor']);
        Route::get('/{id}', [SurveyorClaimController::class, 'showForSurveyor']);
    });


// Routes khusus (read-only)
Route::middleware(['jwt.cookie', 'role:contractor|admin|surveyor|managerial|finance', 'check.status'])
    ->prefix('sites')->group(function () {
        Route::get('/', [SiteController::class, 'index']);     
        Route::get('/{site}', [SiteController::class, 'show']); 
        Route::get('/{site}/pits', [PitController::class, 'index']);
        Route::get('/{site}/blocks', [BlockController::class, 'index']);
        Route::get('/{site}/blocks-by-pit/{pit}', [BlockController::class, 'blocksByPit']);
});


// MANAGERIAL
Route::middleware(['jwt.cookie', 'role:managerial'])
    ->prefix('managerial/claims')
    ->group(function () {
        Route::get('/', [ManagerialController::class, 'index']);
        Route::patch('/{id}/status', [ManagerialController::class, 'updateStatus']);
    });

//FINANCE
Route::middleware(['jwt.cookie', 'role:finance'])
    ->prefix('finance/claims')
    ->group(function () {
        Route::get('/', [FinanceController::class, 'index']);
        Route::patch('/{id}/status', [FinanceController::class, 'updateStatus']);
    });


    //SIGNATURE MANAGE
Route::middleware(['jwt.cookie','role:surveyor|managerial|finance|contractor'])
    ->prefix('signatures')
    ->group(function () {
        Route::post('/{claimId}', [SignatureController::class, 'store']);
        Route::get('/contractor-claims', [SignatureController::class, 'getContractorClaims']);
        Route::get('/{claimId}', [SignatureController::class, 'getClaimWithSignatures']);
        Route::get('/contractor-claims/{claimId}/certificate', [SignatureController::class, 'getContractorClaimDetail']);
        Route::get('/{claimId}/my-signature', [SignatureController::class, 'getMySignature']);
    });

// SITE SETUP ROUTES (ADMIN ONLY)
Route::middleware(['jwt.cookie', 'role:admin', 'check.status'])->prefix('sites')->group(function () {
    // Site API
    Route::post('/', [SiteController::class, 'store']);
    Route::put('/{site}', [SiteController::class, 'update']);
    Route::get('/{site}', [SiteController::class, 'show']); 
    Route::delete('/{site}', [SiteController::class, 'destroy']);

     // PIT API     
    Route::post('/{site}/pits', [PitController::class, 'store']); 
    Route::get('/{site}/pits/{pit}', [PitController::class, 'show']); 
    Route::delete('/{site}/pits/{pit}', [PitController::class, 'destroy']);


    // block API
    Route::post('/{site}/blocks', [BlockController::class, 'storeOrUpdate']); 
    Route::delete('/{site}/blocks/{block}', [BlockController::class, 'destroy']);
    Route::get('/{site}/blocks-by-pit/{pit}', [BlockController::class, 'blocksByPit']);

});


// ===============================
// DASHBOARD (USER SUMMARY)
// ===============================
Route::middleware(['jwt.cookie', 'check.status'])
    ->get('/dashboard', [DashboardController::class, 'index']);



