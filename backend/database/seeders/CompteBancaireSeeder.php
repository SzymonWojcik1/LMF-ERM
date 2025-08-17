<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\CompteBancaire;

class CompteBancaireSeeder extends Seeder
{
    public function run()
    {
        CompteBancaire::create([
            'ban_nom_affichage' => 'Compte UBS',
            'ban_banque' => 'UBS Switzerland AG',
            'ban_devise' => 'CHF',
            'ban_iban' => 'CH44 3199 9123 0008 8901 2',
            'ban_adresse' => 'Rue de la Servette',
            'ban_numero_batiment' => 45,
            'ban_ville' => 'Genève',
            'ban_pays' => 'CH',
            'ban_nom_entreprise' => 'LMF Services Sàrl',
            'ban_npa' => 1202,
            'ban_actif' => true
        ]);

        CompteBancaire::create([
            'ban_nom_affichage' => 'Compte Euros PostFinance',
            'ban_banque' => 'PostFinance',
            'ban_devise' => 'EUR',
            'ban_iban' => 'CH93 0900 0000 6001 2345 7',
            'ban_adresse' => 'Rue du Mont-Blanc',
            'ban_numero_batiment' => 18,
            'ban_ville' => 'Genève',
            'ban_pays' => 'CH',
            'ban_nom_entreprise' => 'LMF Services Sàrl',
            'ban_npa' => 1201,
            'ban_actif' => false
        ]);
    }
}