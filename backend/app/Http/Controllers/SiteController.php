<?php

namespace App\Http\Controllers;

use App\Models\Site;
use App\Enums\SiteStatus;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rules\Enum;
use Illuminate\Support\Facades\Validator;

class SiteController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $sites = Site::query()
            ->with(['client', 'createdBy:id,usr_nom,usr_prenom', 'updatedBy:id,usr_nom,usr_prenom'])
            ->when($request->sit_statut, fn($q) => $q->where('sit_statut', $request->sit_statut))
            ->when($request->search, function ($q, $search) {
                $q->where('sit_nom', 'like', "%$search%")
                  ->orWhere('sit_adresse', 'like', "%$search%")
                  ->orWhere('sit_ville', 'like', "%$search%")
                  ->orWhere('sit_npa', 'like', "%$search%");
            })
            ->when($request->order === 'recent', fn($q) => $q->orderByDesc('sit_updated_at'))
            ->get();

        return response()->json($sites);
    }

    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'sit_client_id' => 'required|exists:clients,cli_id',
            'sit_nom' => 'required|string|max:255',
            'sit_heure' => 'required|string|max:255',
            'sit_nb_personne' => 'required|integer',
            'sit_statut' => ['required', new Enum(SiteStatus::class)],
            'sit_adresse' => 'required|string|max:255',
            'sit_npa' => 'required|integer',
            'sit_ville' => 'required|string|max:255',
            'sit_created_by' => 'required|integer|exists:users,id',
            'sit_updated_by' => 'required|integer|exists:users,id',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = Auth::user();
        $userId = $user ? $user->id : null;

        // Use explicitly provided user IDs from request, or fall back to authenticated user
        $createdBy = $request->sit_created_by ?? $userId ?? 1;
        $updatedBy = $request->sit_updated_by ?? $userId ?? 1;

        $site = Site::create([
            'sit_client_id' => $request->sit_client_id,
            'sit_nom' => $request->sit_nom,
            'sit_heure' => $request->sit_heure,
            'sit_nb_personne' => $request->sit_nb_personne,
            'sit_statut' => $request->sit_statut,
            'sit_adresse' => $request->sit_adresse,
            'sit_npa' => $request->sit_npa,
            'sit_ville' => $request->sit_ville,
            'sit_created_by' => $createdBy,
            'sit_updated_by' => $updatedBy,
        ]);

        return response()->json($site, 201);
    }

    public function show(int $id): JsonResponse
    {
        $site = Site::with([
            'client',
            'createdBy:id,usr_nom,usr_prenom',
            'updatedBy:id,usr_nom,usr_prenom'
        ])->find($id);

        if (!$site) {
            return response()->json(['message' => 'Site not found'], 404);
        }

        return response()->json($site);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $site = Site::find($id);

        if (!$site) {
            return response()->json(['message' => 'Site not found'], 404);
        }

        $validator = Validator::make($request->all(), [
            'sit_client_id' => 'sometimes|exists:clients,cli_id',
            'sit_nom' => 'sometimes|string|max:255',
            'sit_heure' => 'sometimes|string|max:255',
            'sit_nb_personne' => 'sometimes|integer',
            'sit_statut' => ['sometimes', new Enum(SiteStatus::class)],
            'sit_adresse' => 'sometimes|string|max:255',
            'sit_npa' => 'sometimes|integer',
            'sit_ville' => 'sometimes|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = Auth::user();
        $userId = $user ? $user->id : 1; // Default to 1 if no authenticated user

        // If sit_updated_by is provided in the request, use that instead
        $updatedBy = $request->sit_updated_by ?? $userId;

        $site->update(array_merge(
            $request->all(),
            ['sit_updated_by' => $updatedBy]
        ));

        return response()->json($site);
    }

    public function destroy(int $id): JsonResponse
    {
        $site = Site::find($id);

        if (!$site) {
            return response()->json(['message' => 'Site not found'], 404);
        }

        $site->delete();

        return response()->json(['message' => 'Site deleted successfully']);
    }

    public function getByClientId(int $clientId): JsonResponse
    {
        $sites = Site::where('sit_client_id', $clientId)->get();

        return response()->json($sites);
    }

    public function getActiveSites(): JsonResponse
    {
        $sites = Site::where('sit_statut', SiteStatus::ACTIF)->get();

        return response()->json($sites);
    }
}
