<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::disableForeignKeyConstraints();

        Schema::create('sites', function (Blueprint $table) {
            $table->bigIncrements('sit_id');
            $table->unsignedBigInteger('sit_client_id');
            $table->foreign('sit_client_id')->references('cli_id')->on('clients');
            $table->string('sit_nom');
            $table->string('sit_heure');
            $table->bigInteger('sit_nb_personne');
            $table->enum('sit_statut', ["terminé", "actif"]);
            $table->string('sit_adresse');
            $table->bigInteger('sit_npa');
            $table->string('sit_ville');
            $table->unsignedBigInteger('sit_created_by');
            $table->foreign('sit_created_by')->references('id')->on('users');
            $table->unsignedBigInteger('sit_updated_by');
            $table->foreign('sit_updated_by')->references('id')->on('users');
            $table->timestamp('sit_created_at');
            $table->timestamp('sit_updated_at');
        });

        Schema::enableForeignKeyConstraints();
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sites');
    }
};