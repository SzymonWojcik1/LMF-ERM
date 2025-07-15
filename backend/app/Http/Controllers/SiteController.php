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
    /**
     * Display a listing of the sites.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(): JsonResponse
    {
        $sites = Site::with(['client', 'createdBy', 'updatedBy'])->get();
        return response()->json($sites);
    }

    /**
     * Store a newly created site in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
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
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = Auth::user();
        $userId = $user ? $user->usr_id : 1; // Default to 1 if no authenticated user

        $site = Site::create([
            'sit_client_id' => $request->sit_client_id,
            'sit_nom' => $request->sit_nom,
            'sit_heure' => $request->sit_heure,
            'sit_nb_personne' => $request->sit_nb_personne,
            'sit_statut' => $request->sit_statut,
            'sit_adresse' => $request->sit_adresse,
            'sit_npa' => $request->sit_npa,
            'sit_ville' => $request->sit_ville,
            'sit_created_by' => $userId,
            'sit_updated_by' => $userId,
        ]);

        return response()->json($site, 201);
    }

    /**
     * Display the specified site.
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function show(int $id): JsonResponse
    {
        $site = Site::with(['client', 'createdBy', 'updatedBy'])->find($id);

        if (!$site) {
            return response()->json(['message' => 'Site not found'], 404);
        }

        return response()->json($site);
    }

    /**
     * Update the specified site in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
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
        $userId = $user ? $user->usr_id : 1; // Default to 1 if no authenticated user

        $site->update(array_merge(
            $request->all(),
            ['sit_updated_by' => $userId]
        ));

        return response()->json($site);
    }

    /**
     * Remove the specified site from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy(int $id): JsonResponse
    {
        $site = Site::find($id);

        if (!$site) {
            return response()->json(['message' => 'Site not found'], 404);
        }

        $site->delete();

        return response()->json(['message' => 'Site deleted successfully']);
    }

    /**
     * Get sites by client ID.
     *
     * @param  int  $clientId
     * @return \Illuminate\Http\JsonResponse
     */
    public function getByClientId(int $clientId): JsonResponse
    {
        $sites = Site::where('sit_client_id', $clientId)->get();

        return response()->json($sites);
    }

    /**
     * Get active sites.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function getActiveSites(): JsonResponse
    {
        $sites = Site::where('sit_statut', SiteStatus::ACTIF)->get();

        return response()->json($sites);
    }
}
