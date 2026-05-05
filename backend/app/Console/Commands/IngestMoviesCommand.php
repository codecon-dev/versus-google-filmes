<?php

namespace App\Console\Commands;

use App\Services\Embeddings\EmbeddingService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class IngestMoviesCommand extends Command
{
    protected $signature = 'movies:ingest
        {--movies=storage/app/tmdb_5000_movies.csv}
        {--credits=storage/app/tmdb_5000_credits.csv}
        {--batch=50}';

    protected $description = 'Lê os CSVs do TMDB 5000, gera embeddings e popula a tabela movies.';

    public function handle(EmbeddingService $embeddings): int
    {
        $this->info('Carregando credits…');
        $credits = $this->loadCredits(base_path($this->option('credits')));

        $this->info('Carregando movies…');
        $rows = $this->loadMovies(base_path($this->option('movies')));

        $batchSize = (int) $this->option('batch');
        $bar = $this->output->createProgressBar(count($rows));
        $bar->start();

        foreach (array_chunk($rows, $batchSize) as $chunk) {
            $documents = [];
            $payloads = [];

            foreach ($chunk as $row) {
                $movieId = (int) $row['id'];
                $credit = $credits[$movieId] ?? ['cast' => [], 'director' => null];

                $genres = $this->extractNames($row['genres']);
                $keywords = $this->extractNames($row['keywords']);
                $cast = $credit['cast'];
                $director = $credit['director'];

                $documents[] = $this->buildDocument([
                    'title' => $row['title'],
                    'year' => substr($row['release_date'] ?? '', 0, 4),
                    'tagline' => $row['tagline'] ?? '',
                    'overview' => $row['overview'] ?? '',
                    'genres' => $genres,
                    'keywords' => $keywords,
                    'cast' => $cast,
                    'director' => $director,
                ]);

                $payloads[] = [
                    'id' => $movieId,
                    'title' => $row['title'],
                    'original_title' => $row['original_title'] ?: null,
                    'overview' => $row['overview'] ?: null,
                    'tagline' => $row['tagline'] ?: null,
                    'release_date' => $row['release_date'] ?: null,
                    'genres' => json_encode($genres, JSON_UNESCAPED_UNICODE),
                    'keywords' => json_encode($keywords, JSON_UNESCAPED_UNICODE),
                    'cast_members' => json_encode($cast, JSON_UNESCAPED_UNICODE),
                    'director' => $director,
                    'popularity' => (float) ($row['popularity'] ?? 0),
                    'vote_average' => (float) ($row['vote_average'] ?? 0),
                    'vote_count' => (int) ($row['vote_count'] ?? 0),
                    'original_language' => $row['original_language'] ?: null,
                    'runtime' => is_numeric($row['runtime'] ?? null) ? (int) $row['runtime'] : null,
                ];
            }

            try {
                $vectors = $embeddings->embedBatch($documents);
            } catch (\Throwable $e) {
                $this->error("Falha ao embedar batch: {$e->getMessage()}");
                continue;
            }

            $now = now();
            foreach ($payloads as $i => &$payload) {
                $payload['embedding'] = EmbeddingService::toVectorLiteral($vectors[$i]);
                $payload['created_at'] = $now;
                $payload['updated_at'] = $now;
            }
            unset($payload);

            DB::table('movies')->upsert(
                $payloads,
                ['id'],
                [
                    'title', 'original_title', 'overview', 'tagline', 'release_date',
                    'genres', 'keywords', 'cast_members', 'director',
                    'popularity', 'vote_average', 'vote_count',
                    'original_language', 'runtime', 'embedding', 'updated_at',
                ]
            );

            $bar->advance(count($chunk));
        }

        $bar->finish();
        $this->newLine();
        $this->info('Ingestão concluída.');
        $this->comment('Sugestão: rode `php artisan movies:create-index` para criar o índice HNSW se for necessário.');

        return self::SUCCESS;
    }

    private function loadCredits(string $path): array
    {
        $credits = [];
        $fh = fopen($path, 'r');
        $headers = fgetcsv($fh, escape: '');

        while (($row = fgetcsv($fh, escape: '')) !== false) {
            $row = array_combine($headers, $row);
            $cast = json_decode($row['cast'] ?? '[]', true) ?: [];
            $crew = json_decode($row['crew'] ?? '[]', true) ?: [];
            $credits[(int) $row['movie_id']] = [
                'cast' => $this->extractNames($cast, 5),
                'director' => $this->extractDirector($crew),
            ];
        }

        fclose($fh);
        return $credits;
    }

    private function loadMovies(string $path): array
    {
        $rows = [];
        $fh = fopen($path, 'r');
        $headers = fgetcsv($fh, escape: '');

        while (($row = fgetcsv($fh, escape: '')) !== false) {
            $rows[] = array_combine($headers, $row);
        }

        fclose($fh);
        return $rows;
    }

    private function extractNames(string|array $json, ?int $limit = null): array
    {
        $items = is_array($json) ? $json : (json_decode($json ?: '[]', true) ?: []);
        $names = array_values(array_filter(array_column($items, 'name')));
        return $limit ? array_slice($names, 0, $limit) : $names;
    }

    private function extractDirector(array $crew): ?string
    {
        foreach ($crew as $member) {
            if (($member['job'] ?? '') === 'Director') {
                return $member['name'] ?? null;
            }
        }
        return null;
    }

    private function buildDocument(array $data): string
    {
        $lines = [];
        $title = $data['title'];
        if ($data['year']) {
            $title .= " ({$data['year']})";
        }
        $lines[] = $title;

        if ($data['tagline']) $lines[] = $data['tagline'];
        if ($data['overview']) $lines[] = $data['overview'];
        if ($data['genres']) $lines[] = 'Gêneros: ' . implode(', ', $data['genres']);
        if ($data['keywords']) $lines[] = 'Palavras-chave: ' . implode(', ', $data['keywords']);
        if ($data['cast']) $lines[] = 'Elenco: ' . implode(', ', $data['cast']);
        if ($data['director']) $lines[] = 'Direção: ' . $data['director'];

        return implode("\n", $lines);
    }
}
