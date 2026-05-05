import type { MantineColor } from '@mantine/core';

/**
 * Gêneros únicos em `database_filmes/tmdb_5000_movies.csv` (campo `genres`).
 */
export const CSV_GENRE_NAMES = [
  'Action',
  'Adventure',
  'Animation',
  'Comedy',
  'Crime',
  'Documentary',
  'Drama',
  'Family',
  'Fantasy',
  'Foreign',
  'History',
  'Horror',
  'Music',
  'Mystery',
  'Romance',
  'Science Fiction',
  'TV Movie',
  'Thriller',
  'War',
  'Western',
] as const;

export type CsvGenreName = (typeof CSV_GENRE_NAMES)[number];

const PALETTE: MantineColor[] = [
  'red',
  'orange',
  'pink',
  'yellow',
  'blue',
  'teal',
  'cyan',
  'violet',
  'green',
  'grape',
  'indigo',
  'lime',
];

/** Coprimo com 14 espalha bem as primeiras 14 cores antes do ciclo repetir. */
const STEP = 9;

function hashLabel(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}

export const GENRE_COLOR_BY_NAME: Record<CsvGenreName, MantineColor> = Object.fromEntries(
  CSV_GENRE_NAMES.map((name, i) => [name, PALETTE[(i * STEP) % PALETTE.length]])
) as Record<CsvGenreName, MantineColor>;

/** Índice do gênero na lista do CSV, ou -1 se não for um dos 20 conhecidos. */
export function getCsvGenreIndex(label: string): number {
  return (CSV_GENRE_NAMES as readonly string[]).indexOf(label.trim());
}

/**
 * Cor estável por nome. Gêneros fora do CSV usam hash no palette.
 */
export function getGenreColor(label: string): MantineColor {
  const t = label.trim();
  const idx = getCsvGenreIndex(t);
  if (idx >= 0) return GENRE_COLOR_BY_NAME[t as CsvGenreName];
  return PALETTE[hashLabel(t) % PALETTE.length];
}
