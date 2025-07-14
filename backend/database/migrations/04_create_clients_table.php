<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('clients', function (Blueprint $table) {
            $table->bigIncrements('cli_id');
            $table->enum('cli_type', ['particulier', 'entreprise']);
            $table->string('cli_nom_entreprise')->nullable();
            $table->string('cli_nom')->nullable();
            $table->string('cli_prenom')->nullable();
            $table->string('cli_email')->nullable();
            $table->string('cli_adresse')->nullable();
            $table->bigInteger('cli_npa');
            $table->string('cli_ville');
            $table->timestamp('cli_created_at')->nullable();
            $table->timestamp('cli_updated_at')->nullable();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('clients');
    }
};