# Catálogo de filmes (TMDB 5000)

Aplicação full stack para busca e listagem de filmes a partir dos CSVs em `database_filmes/`, com API em Node.js, MongoDB, interface em React (Mantine) e Nginx como proxy reverso e HTTPS opcional.

## Visão geral da arquitetura

```
Navegador  →  Nginx (:8080 HTTP / :8443 HTTPS)
                 ├── /           → arquivos estáticos do React (build)
                 └── /api/*      → proxy para API Express (:3001 no Docker)

API Express  →  MongoDB (:27017, serviço `mongo` no Compose)
                 └── lê CSV em `database_filmes/` no primeiro seed
```

---

## Backend (`backend/`)

Stack: **Node.js (ES modules)**, **Express**, **Mongoose**.

### Estrutura principal


| Caminho                | Descrição                                                                                                  |
| ---------------------- | ---------------------------------------------------------------------------------------------------------- |
| `src/server.js`        | App Express, CORS, conexão MongoDB, montagem das rotas                                                     |
| `src/models/Movie.js`  | Schema do filme + índice de texto (busca) e índices auxiliares                                             |
| `src/routes/movies.js` | Rotas REST sob `/api/movies`                                                                               |
| `src/scripts/seed.js`  | Importa `tmdb_5000_movies.csv` + `tmdb_5000_credits.csv`, faz merge por `id`/`movie_id` e grava no MongoDB |


### Variáveis de ambiente


| Variável      | Descrição                                                                       |
| ------------- | ------------------------------------------------------------------------------- |
| `MONGODB_URI` | URI do MongoDB (ex.: `mongodb://mongo:27017/filmes` no Docker)                  |
| `PORT`        | Porta da API (padrão `3001`)                                                    |
| `DATA_DIR`    | Pasta com os CSV (no Compose: `/data`, montada a partir de `./database_filmes`) |
| `FORCE_SEED`  | Se `1`, apaga a coleção e roda o seed de novo                                   |


### Scripts (`package.json`)

- `npm start` — sobe o servidor
- `npm run dev` — servidor com `--watch`
- `npm run seed` — apenas executa o seed (útil com Mongo local)

### Rotas da API (`/api/movies`)

- `GET /suggest?q=` — sugestões para autocomplete (texto + fallback)
- `GET /search?q=&page=&pageSize=` — busca paginada
- `GET /?page=&pageSize=&sort=` — listagem completa (`releaseDate`, `popularity`, `voteAverage`, `title`)
- `GET /:id` — detalhe por **tmdbId** (número)
- `GET /health` — health check na raiz do servidor (`/health`)

No Docker, o **CMD** da imagem roda `seed` e depois `start`. Se já existirem documentos, o seed pula (exceto com `FORCE_SEED=1`).

---

## Frontend (`frontend/`)

Stack: **Vite**, **React 18**, **TypeScript**, **Mantine v7**, **React Router**, **Tabler Icons**.

### Scripts

- `npm run dev` — desenvolvimento (porta padrão 5173; proxy de `/api` para `http://127.0.0.1:3001` em `vite.config.ts`)
- `npm run build` — gera `dist/` para produção
- `npm run preview` — serve o build localmente

### Estrutura útil


| Caminho                               | Descrição                                           |
| ------------------------------------- | --------------------------------------------------- |
| `src/App.tsx`                         | Shell (Mantine), navegação lateral, rotas           |
| `src/pages/SearchPage.tsx`            | Busca com autocomplete + resultados                 |
| `src/pages/ListPage.tsx`              | Listagem paginada e ordenação                       |
| `src/components/MovieCard.tsx`        | Card clicável                                       |
| `src/components/MovieDetailModal.tsx` | Modal com detalhes (fetch `GET /api/movies/:id`)    |
| `src/components/GenreBadges.tsx`      | Badges de gênero com cores por nome                 |
| `src/constants/genreColors.ts`        | Mapa de cores por gênero do CSV                     |
| `src/api.ts`                          | Chamadas `fetch` à API                              |
| `src/utils/movie.ts`                  | Formatação (datast, USD, listas de gênero/keywords) |


### Telas

1. **Buscar** (`/`) — autocomplete e lista de resultados da busca.
2. **Todos os filmes** (`/filmes`) — catálogo com paginação (topo e rodapé) e ordenação.

---

## MongoDB

### No Docker Compose

- Imagem **MongoDB 7**
- Volume nomeado `**mongo_data`** para persistir `/data/db`
- **Healthcheck** com `mongosh` antes de subir a API
- Banco lógico: `**filmes`**, coleção `**movies**` (via Mongoose)

### Dados e índices

- O **seed** lê os CSV, agrega diretores a partir de `crew` (job `Director`) e monta campos auxiliares para busca (`genreNames`, `keywordNames`, `castNames`, etc.).
- Há **índice de texto** em título, sinopse, tagline, gêneros, keywords, elenco e direção (com pesos maiores em título).
- Índices simples em título, data de lançamento, popularidade e nota.

### Uso local (sem Docker)

Instale o MongoDB na máquina, crie o banco (ou deixe o Mongoose criar ao conectar), defina `MONGODB_URI` e rode `npm run seed` e `npm start` no `backend/`.

---

## Nginx (`nginx/`)

### Papel

- Servir o **build estático** do React (`/usr/share/nginx/html` na imagem).
- Encaminhar `**/api/`** para o serviço `**api:3001**` (mesmo path `/api/...`).
- Oferecer **HTTPS** com certificado **autoassinado** gerado no build da imagem.

### Arquivos

- `nginx/Dockerfile` — multi-stage: build do frontend com Node + imagem Nginx; gera cert em `/etc/nginx/ssl/`.
- `nginx/default.conf` — dois `server`:
  - porta **80**: redirecionamento **301** para HTTPS na porta publicada **8443** do host (`https://$host:8443$request_uri`)
  - porta **443**: TLS (`TLSv1.2`/`TLSv1.3`, HTTP/2), arquivos estáticos e proxy `/api/`

Se você alterar no `docker-compose` a porta HTTPS (ex. `443:443`), ajuste o `:8443` no bloco `listen 80` de `nginx/default.conf` ou use só `https://$host$request_uri` quando HTTPS for a porta padrão.

### Portas expostas (host)


| Host     | Container | Uso                                                      |
| -------- | --------- | -------------------------------------------------------- |
| **8080** | 80        | HTTP — responde **301** para `https://<seu-host>:8443`   |
| **8443** | 443       | HTTPS (avisos de certificado no navegador são esperados) |


---

## Subir o projeto com Docker

Na raiz do repositório:

```bash
docker compose up -d --build
```

- Acesso principal: **[https://localhost:8443](https://localhost:8443)** (recomendado)
- **[http://localhost:8080](http://localhost:8080)** redireciona automaticamente para HTTPS na porta 8443

Requisitos: pasta `database_filmes/` com `tmdb_5000_movies.csv` e `tmdb_5000_credits.csv` (já versionada no projeto).

---

## Desenvolvimento rápido (sem rebuild do Nginx)

1. Subir só o Mongo (ou use MongoDB local).
2. `cd backend && npm install && npm run seed && npm run dev` com `MONGODB_URI` apontando para o Mongo.
3. `cd frontend && npm install && npm run dev` — o Vite repassa `/api` para a API em `3001`.

---

## Estrutura de pastas (resumo)

```
jxpxs/
├── backend/           # API Express + Mongoose
├── frontend/          # React + Vite + Mantine
├── database_filmes/   # CSVs TMDB 5000
├── nginx/             # Dockerfile + default.conf
├── docker-compose.yml
└── README.md
```

