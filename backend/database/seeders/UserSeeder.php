<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('users')->insert([
            'usr_prenom' => 'John',
            'usr_nom' => 'Doe',
            'usr_role' => 'admin',
            'usr_login' => 'john.doe',
            'usr_password' => Hash::make('test'),
            'usr_created_at' => now(),
            'usr_updated_at' => now(),
        ]);
    }
}