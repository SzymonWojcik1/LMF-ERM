<?php

namespace Database\Seeders;

use App\Enums\SiteStatus;
use App\Models\Client;
use App\Models\Site;
use App\Models\User;
use Illuminate\Database\Seeder;

class SiteSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get a client to associate with these sites
        $client = Client::first() ?? Client::factory()->create();

        // Get a user to use as creator/updater
        $user = User::first() ?? User::factory()->create();

        Site::create([
            'sit_client_id' => 2,
            'sit_nom' => 'Site Principal',
            'sit_heure' => '100',
            'sit_nb_personne' => 25,
            'sit_statut' => SiteStatus::ACTIF,
            'sit_adresse' => 'Rue de Lausanne 1',
            'sit_npa' => 1000,
            'sit_ville' => 'Lausanne',
            'sit_created_by' => $user->id,
            'sit_updated_by' => $user->id,
        ]);

        Site::create([
            'sit_client_id' => 1,
            'sit_nom' => 'Site Secondaire',
            'sit_heure' => '90',
            'sit_nb_personne' => 15,
            'sit_statut' => SiteStatus::ACTIF,
            'sit_adresse' => 'Avenue de la Gare 10',
            'sit_npa' => 1003,
            'sit_ville' => 'Lausanne',
            'sit_created_by' => $user->id,
            'sit_updated_by' => $user->id,
        ]);

        Site::create([
            'sit_client_id' => 4,
            'sit_nom' => 'Site Archivé',
            'sit_heure' => '32',
            'sit_nb_personne' => 8,
            'sit_statut' => SiteStatus::TERMINE,
            'sit_adresse' => 'Chemin des Fougères 5',
            'sit_npa' => 1004,
            'sit_ville' => 'Lausanne',
            'sit_created_by' => $user->id,
            'sit_updated_by' => $user->id,
        ]);
    }
}
