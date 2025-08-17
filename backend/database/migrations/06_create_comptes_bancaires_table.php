<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('comptes_bancaires', function (Blueprint $table) {
            $table->id('ban_id');
            $table->string('ban_nom_affichage');
            $table->string('ban_banque');
            $table->string('ban_devise', 3);
            $table->string('ban_iban');
            $table->string('ban_adresse');
            $table->integer('ban_numero_batiment');
            $table->string('ban_ville');
            $table->string('ban_pays', 2);
            $table->string('ban_nom_entreprise');
            $table->integer('ban_npa');
            $table->boolean('ban_actif')->default(true);
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('comptes_bancaires');
    }
};