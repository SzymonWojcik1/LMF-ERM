<?php

namespace App\Models;

use App\Enums\SiteStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Site extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'sites';

    /**
     * The primary key for the model.
     *
     * @var string
     */
    protected $primaryKey = 'id';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
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

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'sit_statut' => SiteStatus::class,
        'sit_created_at' => 'datetime',
        'sit_updated_at' => 'datetime',
    ];

    /**
     * Get the client that owns the site.
     */
    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class, 'sit_client_id', 'cli_id');
    }

    /**
     * Get the user who created the site.
     */
    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'sit_created_by', 'id');
    }

    /**
     * Get the user who last updated the site.
     */
    public function updatedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'sit_updated_by', 'id');
    }

    /**
     * Override the default timestamps for this model
     */
    const CREATED_AT = 'sit_created_at';
    const UPDATED_AT = 'sit_updated_at';
}
