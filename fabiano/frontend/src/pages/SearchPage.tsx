import { Autocomplete, Group, Loader, Stack, Text, Title } from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import { IconSearch } from '@tabler/icons-react';
import { useEffect, useMemo, useState } from 'react';
import { fetchSearch, fetchSuggest, type MovieListItem, type SuggestItem } from '../api';
import { MovieCard } from '../components/MovieCard';
import { MovieDetailModal } from '../components/MovieDetailModal';

export default function SearchPage() {
  const [value, setValue] = useState('');
  const [debounced] = useDebouncedValue(value, 220);
  const [loading, setLoading] = useState(false);
  const [options, setOptions] = useState<string[]>([]);
  const [map, setMap] = useState<Record<string, SuggestItem>>({});
  const [results, setResults] = useState<MovieListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [searching, setSearching] = useState(false);
  const [detailTmdbId, setDetailTmdbId] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    const q = debounced.trim();
    if (q.length < 1) {
      setOptions([]);
      setMap({});
      setLoading(false);
      return;
    }
    setLoading(true);
    fetchSuggest(q)
      .then((items) => {
        if (cancelled) return;
        const m: Record<string, SuggestItem> = {};
        const labels = items.map((it) => {
          const label = `${it.title}${it.originalTitle && it.originalTitle !== it.title ? ` (${it.originalTitle})` : ''}`;
          m[label] = it;
          return label;
        });
        setMap(m);
        setOptions(labels);
      })
      .catch(() => {
        if (!cancelled) {
          setOptions([]);
          setMap({});
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [debounced]);

  const runFullSearch = async (q: string) => {
    const query = q.trim();
    if (!query) {
      setResults([]);
      setTotal(0);
      return;
    }
    setSearching(true);
    try {
      const data = await fetchSearch({ q: query, page: 1, pageSize: 24 });
      setResults(data.items);
      setTotal(data.total);
    } catch {
      setResults([]);
      setTotal(0);
    } finally {
      setSearching(false);
    }
  };

  const rightSection = useMemo(
    () => (loading ? <Loader size="xs" /> : <IconSearch size={18} stroke={1.5} />),
    [loading]
  );

  return (
    <Stack gap="lg" maw={900} mx="auto">
      <div>
        <Title order={2}>Busca</Title>
        <Text c="dimmed" size="sm" mt={4}>
          Digite título, gênero, elenco ou palavras do enredo — sugestões aparecem enquanto você
          digita.
        </Text>
      </div>

      <Autocomplete
        label="Encontrar filme"
        placeholder="Ex: Matrix, Nolan, ficção…"
        data={options}
        value={value}
        onChange={setValue}
        onOptionSubmit={(opt) => {
          const it = map[opt];
          const q = it?.title ?? opt;
          setValue(q);
          void runFullSearch(q);
        }}
        onBlur={() => {
          if (value.trim()) void runFullSearch(value);
        }}
        filter={({ options: opts }) => opts}
        rightSection={rightSection}
        size="md"
      />

      {searching && (
        <Group justify="center" py="xl">
          <Loader />
        </Group>
      )}

      {!searching && results.length > 0 && (
        <Stack gap="sm">
          <Text size="sm" c="dimmed">
            {total} resultado(s) para &quot;{value.trim()}&quot;
          </Text>
          {results.map((m) => (
            <MovieCard
              key={m.tmdbId}
              movie={m}
              overviewLineClamp={3}
              onOpenDetail={() => setDetailTmdbId(m.tmdbId)}
            />
          ))}
        </Stack>
      )}

      <MovieDetailModal tmdbId={detailTmdbId} onClose={() => setDetailTmdbId(null)} />

      {!searching && value.trim() && results.length === 0 && total === 0 && (
        <Text c="dimmed" ta="center" py="xl">
          Nenhum resultado. Tente outras palavras.
        </Text>
      )}
    </Stack>
  );
}
