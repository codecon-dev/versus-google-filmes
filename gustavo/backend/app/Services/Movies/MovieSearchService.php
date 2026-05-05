<?php

namespace App\Services\Movies;

use App\Services\Embeddings\EmbeddingService;
use Illuminate\Support\Facades\DB;

class MovieSearchService
{
    public function __construct(
        private readonly EmbeddingService $embeddings,
    ) {}

    public function search(string $query, int $limit = 12): array
    {
        $vector = $this->embeddings->embed($query);
        $literal = EmbeddingService::toVectorLiteral($vector);

        // Boost de popularidade: similaridade pura pode trazer filme obscuro
        // que casou no overview. Multiplicar por log(vote_count) suaviza.
        $sql = <<<SQL
            SELECT
                id, title, original_title, overview, tagline, release_date,
                genres, keywords, cast_members, director,
                vote_average, vote_count, popularity, runtime,
                1 - (embedding <=> ?::vector) AS similarity,
                (1 - (embedding <=> ?::vector)) * (1 + 0.05 * ln(GREATEST(vote_count, 1))) AS score
            FROM movies
            WHERE embedding IS NOT NULL
            ORDER BY score DESC
            LIMIT ?
        SQL;

        $rows = DB::select($sql, [$literal, $literal, $limit]);

        return array_map(function ($row) {
            $row->genres = json_decode($row->genres, true);
            $row->keywords = json_decode($row->keywords, true);
            $row->cast_members = json_decode($row->cast_members, true);
            return $row;
        }, $rows);
    }
}
