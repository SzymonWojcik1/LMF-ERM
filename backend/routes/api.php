<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;

//Route::get('/user', function (Request $request) {
//    return $request->user();
//})->middleware('auth:sanctum');
Route::get('/', function () {
    return 'API';
});

// Route de login
Route::post('/login', [AuthController::class, 'login']);

// Route protégée pour tester l'authentification
Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});