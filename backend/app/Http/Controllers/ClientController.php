<?php

namespace App\Http\Controllers;

use App\Models\Client;
use Illuminate\Http\Request;
use Illuminate\Validation\Rules\Enum;
use App\Enums\ClientType;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class ClientController extends Controller
{
    // List all clients with optional filters
    public function index(Request $request)
    {
        $clients = Client::query()
            ->when($request->cli_type, fn($q) => $q->where('cli_type', $request->cli_type))
            ->when($request->search, function ($q, $search) {
                $q->where(function ($q2) use ($search) {
                    $q2->where('cli_nom_entreprise', 'like', "%$search%")
                       ->orWhere('cli_prenom', 'like', "%$search%")
                       ->orWhere('cli_email', 'like', "%$search%")
                       ->orWhere('cli_adresse', 'like', "%$search%")
                       ->orWhere('cli_ville', 'like', "%$search%")
                       ->orWhere('cli_npa', 'like', "%$search%");
                });
            })
            ->when($request->order === 'recent', fn($q) => $q->orderByDesc('cli_updated_at'))
            ->get();

        return response()->json($clients);
    }

    // Create a new client
    public function store(Request $request)
    {
        $validated = $request->validate([
            'cli_type' => ['required', new Enum(ClientType::class)],
            'cli_nom_entreprise' => 'nullable|string|max:255',
            'cli_nom' => 'nullable|string|max:255',
            'cli_prenom' => 'nullable|string|max:255',
            'cli_email' => 'nullable|email|max:255',
            'cli_adresse' => 'nullable|string|max:255',
            'cli_npa' => 'required|numeric|digits:4',
            'cli_ville' => 'required|string|max:255',
        ]);

        if ($validated['cli_type'] === ClientType::ENTREPRISE->value && empty($validated['cli_nom_entreprise'])) {
            return response()->json(['errors' => [
                'cli_nom_entreprise' => 'Requis pour un client entreprise.'
            ]], 422);
        }

        if ($validated['cli_type'] === ClientType::PARTICULIER->value && empty($validated['cli_prenom'])) {
            return response()->json(['errors' => [
                'cli_prenom' => 'Requis pour un client particulier.'
            ]], 422);
        }

        $validated['cli_type'] = ClientType::from($validated['cli_type']);
        $validated['cli_created_at'] = now();
        $validated['cli_updated_at'] = now();

        $client = Client::create($validated);

        return response()->json($client, 201);
    }

    // Get a specific client by ID
    public function show(string $id)
    {
        $client = Client::findOrFail($id);
        return response()->json($client);
    }

    // Update a client
    public function update(Request $request, string $id)
    {
        $client = Client::findOrFail($id);

        $validated = $request->validate([
            'cli_type' => ['required', new Enum(ClientType::class)],
            'cli_nom_entreprise' => 'nullable|string|max:255',
            'cli_nom' => 'nullable|string|max:255',
            'cli_prenom' => 'nullable|string|max:255',
            'cli_email' => 'nullable|string|max:255',
            'cli_adresse' => 'nullable|string|max:255',
            'cli_npa' => 'required|numeric',
            'cli_ville' => 'required|string|max:255',
        ]);

        if ($validated['cli_type'] === ClientType::ENTREPRISE->value && empty($validated['cli_nom_entreprise'])) {
            return response()->json(['errors' => [
                'cli_nom_entreprise' => 'Requis pour un client entreprise.'
            ]], 422);
        }

        if ($validated['cli_type'] === ClientType::PARTICULIER->value && empty($validated['cli_prenom'])) {
            return response()->json(['errors' => [
                'cli_prenom' => 'Requis pour un client particulier.'
            ]], 422);
        }

        $validated['cli_type'] = ClientType::from($validated['cli_type']);
        $validated['cli_updated_at'] = now();

        $client->update($validated);

        return response()->json($client);
    }

    // Delete a client
    public function destroy(string $id)
    {
        try {
            DB::beginTransaction();

            $client = Client::findOrFail($id);

            // Check if client has sites
            $sites = \App\Models\Site::where('sit_client_id', $id)->get();

            // Delete related sites first
            foreach ($sites as $site) {
                $site->delete();
            }

            // Then delete the client
            $client->delete();

            DB::commit();
            return response()->json(['message' => 'Client supprimé avec succès.']);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Erreur lors de la suppression du client: ' . $e->getMessage()], 500);
        }
    }
}