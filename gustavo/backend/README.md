# TMDB Movie Search

Busca semântica vetorial sobre o dataset TMDB 5000. Usuário digita query em linguagem natural ("filme melancólico sobre solidão urbana", "ficção científica anos 80 com robô"), recebe lista ordenada por relevância semântica + popularidade.

> **Não é RAG completo** — é busca vetorial pura, sem LLM gerando resposta. Saída são cards de filmes; explicação textual seria custo desnecessário. Veja [CONTEXT.md](CONTEXT.md) para o rationale completo.

## Stack

- Laravel 13 (PHP 8.3+)
- PostgreSQL com extensão `pgvector`
- OpenAI `text-embedding-3-small` (1536 dimensões)

## Setup

### 1. Dependências

```bash
composer install
```

### 2. Banco

PostgreSQL com a extensão pgvector habilitada (a migração roda `CREATE EXTENSION vector`).

```bash
php artisan migrate
```

### 3. Variáveis de ambiente (`.env`)

```env
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_DATABASE=tmdb_search

OPENAI_API_KEY=sk-...
OPENAI_EMBEDDING_MODEL=text-embedding-3-small
```

### 4. Datasets

Coloque os CSVs em `storage/app/`:

- `tmdb_5000_movies.csv`
- `tmdb_5000_credits.csv`

### 5. Ingestão

```bash
php artisan movies:ingest
```

Isso lê os dois CSVs, monta um documento sintético por filme (title, year, tagline, overview, gêneros, keywords, top 5 cast, director), gera embeddings em batch e popula a tabela `movies`. Custo: ~$0.50, ~3 min.

> Se estourar memória: aumente `memory_limit` no `php.ini` (1G é folga). Veja [docs/DECISIONS.md](docs/DECISIONS.md) para o porquê.

## Endpoint

### `GET /api/movies/search`

| Parâmetro | Tipo           | Default     | Descrição                  |
| --------- | -------------- | ----------- | -------------------------- |
| `q`       | string (2-200) | obrigatório | Query em linguagem natural |
| `limit`   | int (1-50)     | 12          | Número de resultados       |

Exemplo:

```bash
curl 'http://localhost:8000/api/movies/search?q=filme+melanc%C3%B3lico+sobre+solid%C3%A3o+urbana'
```

Resposta:

```json
{
  "query": "filme melancólico sobre solidão urbana",
  "count": 12,
  "data": [
    {
      "id": 49047,
      "title": "Gravity",
      "overview": "...",
      "genres": ["Science Fiction", "Thriller"],
      "keywords": ["loneliness", "space"],
      "cast_members": ["Sandra Bullock", "George Clooney", "..."],
      "director": "Alfonso Cuarón",
      "vote_average": 7.3,
      "vote_count": 5879,
      "similarity": 0.83,
      "score": 0.95
    }
  ]
}
```

## Algoritmo de busca

1. Embedda a query (1 chamada OpenAI, ~50ms)
2. Cosine distance contra todos os filmes no Postgres (operador `<=>`)
3. Score = `similarity * (1 + 0.05 * ln(GREATEST(vote_count, 1)))` — boost de popularidade pra evitar filmes obscuros mal avaliados subindo só por casamento de sinopse
4. `ORDER BY score DESC LIMIT N`

O coeficiente `0.05` é o knob de calibração (`0.10` = mais blockbusters; `0.02` = mais nicho).

## Estrutura

```text
app/
├── Console/Commands/IngestMoviesCommand.php   # php artisan movies:ingest
├── Http/Controllers/MovieSearchController.php # GET /api/movies/search
├── Models/Movie.php
├── Providers/AppServiceProvider.php           # singleton EmbeddingService
└── Services/
    ├── Embeddings/EmbeddingService.php        # embed, embedBatch, toVectorLiteral
    └── Movies/MovieSearchService.php

database/migrations/*_create_movies_table.php  # tabela + CREATE EXTENSION vector
routes/api.php
```

## Documentação adicional

- [CONTEXT.md](CONTEXT.md) — visão arquitetural completa, decisões de design, anti-padrões
- [docs/DECISIONS.md](docs/DECISIONS.md) — log de decisões tomadas durante a implementação
