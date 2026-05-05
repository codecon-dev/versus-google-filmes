<?php

namespace App\Services\Embeddings;

use Illuminate\Support\Facades\Http;

class EmbeddingService
{
    public function __construct(
        private readonly string $apiKey,
        private readonly string $model,
    ) {}

    public function embed(string $text): array
    {
        return $this->embedBatch([$text])[0];
    }

    /**
     * @param  string[]  $texts
     * @return array<int, array<int, float>>
     */
    public function embedBatch(array $texts): array
    {
        $response = Http::withToken($this->apiKey)
            ->timeout(60)
            ->retry(3, 1500, throw: false)
            ->post('https://api.openai.com/v1/embeddings', [
                'model' => $this->model,
                'input' => $texts,
            ])
            ->throw()
            ->json();

        return array_map(fn ($item) => $item['embedding'], $response['data']);
    }

    public static function toVectorLiteral(array $vector): string
    {
        return '[' . implode(',', $vector) . ']';
    }
}
