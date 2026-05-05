export function formatYear(d?: string): string {
  if (!d) return '';
  const y = new Date(d).getFullYear();
  return Number.isNaN(y) ? '' : String(y);
}

export function parseGenreList(genreNames?: string): string[] {
  if (!genreNames?.trim()) return [];
  return genreNames
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

export function parseKeywordList(keywordNames?: string): string[] {
  if (!keywordNames?.trim()) return [];
  return keywordNames
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

const usd = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

export function formatUsd(value?: number | null): string {
  if (value == null || value === 0) return '—';
  return usd.format(value);
}

export function formatReleaseDate(d?: string): string {
  if (!d) return '—';
  const date = new Date(d);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}
