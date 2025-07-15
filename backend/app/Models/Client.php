<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Enums\ClientType;

class Client extends Model
{
    use HasFactory;

    protected $table = 'clients';
    protected $primaryKey = 'cli_id';
    public $incrementing = true;
    public $timestamps = false;

    protected $fillable = [
        'cli_type',
        'cli_nom_entreprise',
        'cli_nom',
        'cli_prenom',
        'cli_email',
        'cli_adresse',
        'cli_npa',
        'cli_ville',
        'cli_created_at',
        'cli_updated_at',
    ];

    protected $casts = [
        'cli_type' => ClientType::class,
        'cli_created_at' => 'datetime',
        'cli_updated_at' => 'datetime',
    ];
}