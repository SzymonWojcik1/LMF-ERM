<?php

namespace Database\Seeders;

use App\Enums\ClientType;
use App\Models\Client;
use Illuminate\Database\Seeder;

class ClientSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Client entreprise 1
        Client::create([
            'cli_type' => ClientType::ENTREPRISE,
            'cli_nom_entreprise' => 'Tech Solutions SA',
            'cli_email' => 'contact@techsolutions.ch',
            'cli_adresse' => 'Rue de l\'Innovation 25',
            'cli_npa' => 1204,
            'cli_ville' => 'Genève',
            'cli_created_at' => now(),
            'cli_updated_at' => now(),
        ]);

        // Client entreprise 2
        Client::create([
            'cli_type' => ClientType::ENTREPRISE,
            'cli_nom_entreprise' => 'Swiss Data Center',
            'cli_nom' => 'Gagarine',
            'cli_prenom' => 'Pierre',
            'cli_email' => 'info@swissdata.ch',
            'cli_adresse' => 'Avenue des Serveurs 10',
            'cli_npa' => 1015,
            'cli_ville' => 'Lausanne',
            'cli_created_at' => now(),
            'cli_updated_at' => now(),
        ]);

        // Client particulier 1
        Client::create([
            'cli_type' => ClientType::PARTICULIER,
            'cli_nom' => 'Dupont',
            'cli_prenom' => 'Jean',
            'cli_email' => 'jean.dupont@email.ch',
            'cli_adresse' => 'Chemin des Fleurs 8',
            'cli_npa' => 1260,
            'cli_ville' => 'Nyon',
            'cli_created_at' => now(),
            'cli_updated_at' => now(),
        ]);

        // Client particulier 2
        Client::create([
            'cli_type' => ClientType::PARTICULIER,
            'cli_nom' => 'Müller',
            'cli_prenom' => 'Sarah',
            'cli_email' => 'sarah.muller@email.ch',
            'cli_adresse' => 'Rue du Lac 45',
            'cli_npa' => 1800,
            'cli_ville' => 'Vevey',
            'cli_created_at' => now(),
            'cli_updated_at' => now(),
        ]);

        // Client particulier 3
        Client::create([
            'cli_type' => ClientType::PARTICULIER,
            'cli_nom' => 'Rochat',
            'cli_prenom' => 'Michel',
            'cli_email' => 'michel.rochat@email.ch',
            'cli_adresse' => 'Avenue de la Gare 12',
            'cli_npa' => 1950,
            'cli_ville' => 'Sion',
            'cli_created_at' => now(),
            'cli_updated_at' => now(),
        ]);
    }
}
