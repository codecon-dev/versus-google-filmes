# Decisões de implementação

Log de decisões técnicas tomadas durante a construção do TMDB Movie Search. Cada entrada explica **o que** foi decidido, **por quê**, e **trade-offs** considerados — não apenas o resultado final.

Para o panorama arquitetural (não-RAG, embedding sintético, knob de popularidade, anti-padrões), veja [CONTEXT.md](../CONTEXT.md). Este arquivo é o "behind the scenes" de cada mudança no código.

---

## 1. `EmbeddingService` registrado como singleton

**Onde:** [app/Providers/AppServiceProvider.php](../app/Providers/AppServiceProvider.php)

```php
$this->app->singleton(EmbeddingService::class, fn () => new EmbeddingService(
    config('services.openai.key'),
    config('services.openai.embedding_model'),
));
```

**Por quê singleton:** o serviço não tem estado mutável — só guarda a API key e o modelo. Instanciar uma vez por request basta. Singleton também simplifica mock em testes (`$this->app->instance(EmbeddingService::class, $mock)`).

**Por quê via container e não `new` direto:** o `MovieSearchController` resolve via type-hint, e os testes do `MovieSearchService` precisam injetar um mock. Container é o caminho idiomático em Laravel.

**Trade-off considerado:** poderia usar binding com `bind()` (não-singleton) se o serviço tivesse estado por request. Não tem.

---

## 2. Naming: `Embedings` → `Embeddings`

**Onde:** namespace e pasta de `EmbeddingService`, todos os imports.

A pasta inicial estava com um 'd' só. Ortografia inglesa correta tem dois ('embedding' = ato de embedar). PSR-4 obriga consistência absoluta entre namespace e estrutura de pastas — qualquer divergência quebra autoload.

**Por quê arrumar agora:** com o nome errado, o erro só aparece em runtime (`Target class [...] does not exist`) e confunde o diagnóstico, porque a pasta "parece existir". Nomes corretos antes de mais código depender deles.

---

## 3. `fgetcsv(escape: '')` na ingestão

**Onde:** [app/Console/Commands/IngestMoviesCommand.php](../app/Console/Commands/IngestMoviesCommand.php) — métodos `loadCredits` e `loadMovies`.

**Sintoma:** `array_combine(): Argument #1 ($keys) and argument #2 ($values) must have the same number of elements`. Algumas linhas do CSV vinham com número diferente de colunas que o header.

**Causa-raiz:** os campos `cast` e `crew` do TMDB contêm JSONs com aspas escapadas (`\"`). O `escape` default do `fgetcsv` é `\` (não-padrão CSV — herança histórica do PHP). Quando o parser vê `\"`, trata como caractere literal e quebra o casamento de aspas, desalinhando colunas.

**Fix:** passar `escape: ''` desativa o escape do PHP e usa parsing RFC 4180 puro, onde só `""` (aspa dupla duplicada) escapa aspa dentro de campo. Isso é exatamente o que o CSV do TMDB faz.

**Trade-off:** funciona em PHP 7.4+. Em PHP 8.4 vira default. Sem custo.

---

## 4. Pré-extração de cast + director em `loadCredits`

**Onde:** [app/Console/Commands/IngestMoviesCommand.php:loadCredits](../app/Console/Commands/IngestMoviesCommand.php)

**Antes:** armazenava `['cast' => $jsonArray, 'crew' => $jsonArray]` no array `$credits`. Cada `cast` + `crew` decodificado tem ~50KB. 5000 filmes × 50KB = ~250MB só nos credits — estourava `memory_limit=128M`.

**Depois:** decodifica o JSON, extrai os 5 nomes do top cast e o director ali mesmo, descarta o resto. Cada entrada do `$credits` cai para ~70 bytes. Total: ~350KB.

**Por quê extrair na hora do load e não durante o processamento:** o uso é determinístico (sempre top 5 + director) e os JSONs grandes não servem pra mais nada. Decodificar uma vez e descartar o lixo é mais barato que carregar tudo e descartar depois.

---

## 5. Streaming refactor revertido em favor de `memory_limit`

**Contexto:** ao chegar 32% da ingestão, estourava memória de novo (agora no `embedBatch` por causa de respostas HTTP retidas + `array_chunk` duplicando o `$rows`). Comecei a refatorar para um generator que streamava o CSV chunk por chunk, sem materializar tudo.

**Decisão:** revertido. O usuário disse que tinha RAM de sobra e preferiu bumpar `memory_limit` no `php.ini` (de 128M para 1G).

**Por quê faz sentido:** o ingest é um processo batch que roda raramente (uma vez no setup, ou ao trocar modelo de embedding). Pagar complexidade arquitetural permanente para resolver problema que não vai aparecer no caminho quente é over-engineering. Bumpar memória é `O(1)` em código, `O(0)` em cognição.

**Quando reconsiderar:** se o catálogo passar de ~50k filmes, a abordagem stream vira obrigatória — aí sim refatora.

---

## 6. `MovieSearchService` movido para `app/Services/Movies/`

**Onde:** estava em `app/Providers/Movies/MovieSearchService.php`. Movido para [app/Services/Movies/MovieSearchService.php](../app/Services/Movies/MovieSearchService.php).

**Por quê:** o namespace dentro do arquivo era `App\Services\Movies` (correto), mas a pasta era `Providers/Movies` (errada). PSR-4 mapeia 1:1 namespace↔pasta — autoload não conseguia resolver a classe e dava `ReflectionException`.

**Por quê não mexi no namespace em vez de mover:** `Services` é o lugar semanticamente correto (services contêm regra de negócio); `Providers` é para service providers do Laravel. O bug foi a localização do arquivo, não o namespace.

---

## 7. Normalização de query no controller

**Onde:** [app/Http/Controllers/MovieSearchController.php](../app/Http/Controllers/MovieSearchController.php)

```php
$query = trim(preg_replace('/\s+/', ' ', str_replace('+', ' ', $validated['q'])));
```

**Por quê:** apareceu uma URL com `%2B` no lugar de `+` para espaço (double-encoding). `%2B` decodifica para `+` literal, então a query chega como `"filme+melancólico+sobre+solidão+urbana"` (palavras grudadas com `+`). Embedar isso degrada significativamente a qualidade da busca semântica — o modelo nunca viu "melancólico+sobre" e o embedding fica ruidoso.

**Defesas em ordem:**

1. `str_replace('+', ' ')` — converte `+` literais em espaço (cobre o caso do double-encoding)
2. `preg_replace('/\s+/', ' ')` — colapsa múltiplos espaços em um só
3. `trim` — remove espaço nas pontas

**Trade-off:** queries com `+` legítimo (tipo "C++") perdem o `+`. Aceitável para busca de filmes — não é o domínio do usuário. Se um dia importar, dá pra trocar por uma normalização mais cirúrgica (só substitui `+` quando entre duas letras minúsculas, por exemplo).

**Também:** o JSON de resposta passou a devolver a query normalizada (`'query' => $query`) em vez do input cru. Isso ajuda o frontend a saber exatamente o que foi buscado e a renderizar "Resultados para: ..." de forma consistente.

---

## 8. `import` corrigido no `AppServiceProvider`

**Trace:** num primeiro momento eu tinha escrito `use App\Services\Embedings\EmbeddingService;` (um 'd' só) baseado em uma leitura equivocada do output de busca. Quando o usuário rodou `php artisan movies:ingest`, deu `Target class [App\Services\Embeddings\EmbeddingService] does not exist` porque o singleton estava registrado contra um símbolo que não existia.

**Lição registrada:** sempre confirmar caminho/namespace lendo o arquivo real antes de escrever `use` em outro lugar. Custou um turn extra que poderia ter sido evitado.

---

## Decisões de **não fazer** (ainda)

- **Índice HNSW:** custo > benefício para 5k linhas (scan sequencial é mais rápido). Threshold para criar: ~50k filmes.
- **Pacote PHP wrapper de pgvector:** SQL raw com `?::vector` cast resolve com zero dependências. Nenhuma vantagem em adicionar.
- **Backfill de poster URLs (TMDB API):** discutido e adiado. Quando for feito, será como um command separado (`movies:backfill-posters`) que adiciona coluna `poster_path` e popula em batch. Token TMDB exposto em chat — gerar novo antes de seguir.
- **Refatoração para streaming na ingestão:** ver seção 5. Adiar até passar de ~50k filmes.
- **Rate limit no endpoint de busca:** pendência. `throttle:30,1` no route group resolve quando precisar.
- **Cache Redis de embedding de query:** queries repetidas ("ação anos 90") são frequentes; chamada à OpenAI vira gargalo. Adiar até ter tráfego que justifique.
