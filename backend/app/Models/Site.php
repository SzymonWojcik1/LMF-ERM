<?php

namespace App\Models;

use App\Enums\SiteStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Site extends Model
{
    use HasFactory;

    protected $table = 'sites';
    protected $primaryKey = 'sit_id';


    protected $fillable = [
        'sit_client_id',
        'sit_nom',
        'sit_heure',
        'sit_nb_personne',
        'sit_statut',
        'sit_adresse',
        'sit_npa',
        'sit_ville',
        'sit_created_by',
        'sit_updated_by',
    ];


    protected $casts = [
        'sit_statut' => SiteStatus::class,
        'sit_created_at' => 'datetime',
        'sit_updated_at' => 'datetime',
    ];

    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class, 'sit_client_id', 'cli_id');
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'sit_created_by', 'id');
    }

    public function updatedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'sit_updated_by', 'id');
    }

    const CREATED_AT = 'sit_created_at';
    const UPDATED_AT = 'sit_updated_at';
}
