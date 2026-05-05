export const API_BASE =
  (import.meta.env.VITE_CINEFAREJO_API as string | undefined) ?? "http://localhost:8000";

export interface Movie {
  id: number;
  title: string;
  original_title: string;
  overview: string;
  tagline: string | null;
  release_date: string;
  genres: string[];
  keywords: string[];
  cast_members: string[];
  director: string;
  vote_average: string;
  vote_count: number;
  popularity: string;
  runtime: number;
  similarity: string;
  score: string;
}

export interface SearchResponse {
  query: string;
  count: number;
  data: Movie[];
}

export async function searchMovies(q: string): Promise<SearchResponse> {
  const url = `${API_BASE}/api/movies/search?q=${encodeURIComponent(q)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Erro ${res.status} ao consultar a API`);
  return res.json();
}
