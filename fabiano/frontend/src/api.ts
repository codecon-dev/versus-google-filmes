export type SuggestItem = {
  id: number;
  title: string;
  originalTitle?: string;
  releaseDate?: string;
  voteAverage?: number;
  subtitle?: string;
};

export async function fetchSuggest(q: string): Promise<SuggestItem[]> {
  const u = new URL('/api/movies/suggest', window.location.origin);
  u.searchParams.set('q', q);
  u.searchParams.set('limit', '15');
  const r = await fetch(u.toString());
  if (!r.ok) throw new Error('Falha na sugestão');
  const j = (await r.json()) as { items: SuggestItem[] };
  return j.items ?? [];
}

export type MovieListItem = {
  tmdbId: number;
  title: string;
  originalTitle?: string;
  overview?: string;
  tagline?: string;
  releaseDate?: string;
  runtime?: number;
  voteAverage?: number;
  voteCount?: number;
  popularity?: number;
  genres?: { id: number; name: string }[];
  genreNames?: string;
  keywordNames?: string;
  castNames?: string;
  directorNames?: string;
  castPreview?: { name?: string; character?: string }[];
  homepage?: string;
  status?: string;
  budget?: number;
  revenue?: number;
  originalLanguage?: string;
};

/** Resposta de GET /api/movies/:tmdbId (campos extras conforme o banco). */
export type MovieDetail = MovieListItem;

export async function fetchMovies(params: {
  page: number;
  pageSize: number;
  sort: string;
}): Promise<{ items: MovieListItem[]; total: number }> {
  const u = new URL('/api/movies', window.location.origin);
  u.searchParams.set('page', String(params.page));
  u.searchParams.set('pageSize', String(params.pageSize));
  u.searchParams.set('sort', params.sort);
  const r = await fetch(u.toString());
  if (!r.ok) throw new Error('Falha ao listar');
  return r.json();
}

export async function fetchSearch(params: {
  q: string;
  page: number;
  pageSize: number;
}): Promise<{ items: MovieListItem[]; total: number }> {
  const u = new URL('/api/movies/search', window.location.origin);
  u.searchParams.set('q', params.q);
  u.searchParams.set('page', String(params.page));
  u.searchParams.set('pageSize', String(params.pageSize));
  const r = await fetch(u.toString());
  if (!r.ok) throw new Error('Falha na busca');
  return r.json();
}

export async function fetchMovieById(tmdbId: number): Promise<MovieDetail> {
  const r = await fetch(`/api/movies/${tmdbId}`);
  if (r.status === 404) throw new Error('Filme não encontrado');
  if (!r.ok) throw new Error('Falha ao carregar filme');
  return r.json() as Promise<MovieDetail>;
}
