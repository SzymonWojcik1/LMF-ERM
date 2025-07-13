<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasFactory, Notifiable, HasApiTokens;

    protected $table = 'users';

    protected $fillable = [
        'usr_prenom',
        'usr_nom',
        'usr_role',
        'usr_login',
        'usr_password',
        'usr_remember_token',
    ];

    protected $hidden = [
        'usr_password',
        'usr_remember_token',
    ];

    protected function casts(): array
    {
        return [
            'usr_created_at' => 'datetime',
            'usr_updated_at' => 'datetime',
        ];
    }

    /**
     * Définir le nom du champ utilisé pour l'identifiant de connexion
     */
    public function getAuthIdentifierName()
    {
        return 'usr_login';
    }

    /**
     * Définir le nom du champ pour le mot de passe
     */
    public function getAuthPassword()
    {
        return $this->usr_password;
    }

    /**
     * Définir le champ utilisé pour le remember token
     */
    public function getRememberTokenName()
    {
        return 'usr_remember_token';
    }
}