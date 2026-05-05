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


        Schema::create('movies', function (Blueprint $table) {
            $table->unsignedBigInteger('id')->primary(); // id do TMDB
            $table->string('title');
            $table->string('original_title')->nullable();
            $table->text('overview')->nullable();
            $table->string('tagline')->nullable();
            $table->date('release_date')->nullable();
            $table->jsonb('genres')->default('[]');
            $table->jsonb('keywords')->default('[]');
            $table->jsonb('cast_members')->default('[]'); // "cast" é reservado
            $table->string('director')->nullable();
            $table->float('popularity')->default(0);
            $table->float('vote_average')->default(0);
            $table->integer('vote_count')->default(0);
            $table->string('original_language', 8)->nullable();
            $table->integer('runtime')->nullable();
            $table->timestamps();
        });

        // 1536 = dimensão do text-embedding-3-small
        DB::statement('ALTER TABLE movies ADD COLUMN embedding vector(1536)');

        // Índice HNSW: opcional pra 5k linhas (scan sequencial já é instantâneo),
        // mas deixa pronto pra crescer. Crie DEPOIS da ingestão pra ser mais rápido.
        // DB::statement('CREATE INDEX movies_embedding_idx ON movies USING hnsw (embedding vector_cosine_ops)');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('movies');
    }
};
