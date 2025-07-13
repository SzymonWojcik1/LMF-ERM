<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Handle user login request
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function login(Request $request)
    {
        $request->validate([
            'login' => 'required',
            'password' => 'required',
        ]);

        // Recherche de l'utilisateur par son login
        $user = User::where('usr_login', $request->login)->first();

        // Vérification du mot de passe
        if (! $user || ! Hash::check($request->password, $user->usr_password)) {
            throw ValidationException::withMessages([
                'login' => ['Les informations d\'identification fournies sont incorrectes.'],
            ]);
        }

        // Génération du token d'accès
        $token = $user->createToken('auth-token')->plainTextToken;

        // Retourne l'utilisateur et son token
        return response()->json([
            'user' => $user,
            'token' => $token,
        ]);
    }
}
