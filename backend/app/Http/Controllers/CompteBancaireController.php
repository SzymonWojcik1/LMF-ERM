<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\CompteBancaire;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class CompteBancaireController extends Controller
{
    public function index(): JsonResponse
    {
        $comptes = CompteBancaire::orderBy('ban_nom_affichage')->get();
        return response()->json($comptes);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'ban_nom_affichage' => 'required|string|max:255',
            'ban_banque' => 'required|string|max:255',
            'ban_devise' => 'required|string|max:3',
            'ban_iban' => 'required|string|max:255',
            'ban_adresse' => 'required|string|max:255',
            'ban_numero_batiment' => 'required|integer',
            'ban_ville' => 'required|string|max:255',
            'ban_pays' => 'required|string|max:2',
            'ban_nom_entreprise' => 'required|string|max:255',
            'ban_npa' => 'required|integer',
            'ban_actif' => 'boolean'
        ]);

        $compte = CompteBancaire::create($request->all());
        return response()->json($compte, 201);
    }

    public function show(CompteBancaire $compteBancaire): JsonResponse
    {
        return response()->json($compteBancaire);
    }

    public function update(Request $request, CompteBancaire $compteBancaire): JsonResponse
    {
        $request->validate([
            'ban_nom_affichage' => 'required|string|max:255',
            'ban_banque' => 'required|string|max:255',
            'ban_devise' => 'required|string|max:3',
            'ban_iban' => 'required|string|max:255',
            'ban_adresse' => 'required|string|max:255',
            'ban_numero_batiment' => 'required|integer',
            'ban_ville' => 'required|string|max:255',
            'ban_pays' => 'required|string|max:2',
            'ban_nom_entreprise' => 'required|string|max:255',
            'ban_npa' => 'required|integer',
            'ban_actif' => 'boolean'
        ]);

        $compteBancaire->update($request->all());
        return response()->json($compteBancaire);
    }

    public function destroy(CompteBancaire $compteBancaire): JsonResponse
    {
        $compteBancaire->delete();
        return response()->json(['message' => 'Compte bancaire supprimé avec succès']);
    }
}