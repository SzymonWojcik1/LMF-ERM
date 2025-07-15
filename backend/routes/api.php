<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ClientController;
use App\Http\Controllers\SiteController;

// API route test
Route::get('/', function () {
    return 'API';
});

// Authentication routes
Route::post('/login', [AuthController::class, 'login']);
Route::middleware('auth:sanctum')->post('/logout', [AuthController::class, 'logout']);

// Route protected by authentication test
Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

// Routes for the management of clients (protected by authentication)
Route::middleware('auth:sanctum')->group(function () {
    Route::apiResource('clients', ClientController::class);

    // Routes for the management of sites
    Route::apiResource('sites', SiteController::class);
    Route::get('clients/{clientId}/sites', [SiteController::class, 'getByClientId']);
    Route::get('sites/status/active', [SiteController::class, 'getActiveSites']);
});