<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CompteBancaire extends Model
{
    use HasFactory;

    protected $table = 'comptes_bancaires';
    protected $primaryKey = 'ban_id';

    protected $fillable = [
        'ban_nom_affichage',
        'ban_banque',
        'ban_devise',
        'ban_iban',
        'ban_adresse',
        'ban_numero_batiment',
        'ban_ville',
        'ban_pays',
        'ban_nom_entreprise',
        'ban_npa',
        'ban_actif'
    ];

    protected $casts = [
        'ban_actif' => 'boolean',
        'ban_numero_batiment' => 'integer',
        'ban_npa' => 'integer'
    ];
}