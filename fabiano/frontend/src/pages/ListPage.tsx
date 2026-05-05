import { Group, Loader, Pagination, Select, Stack, Text, Title } from '@mantine/core';
import { useEffect, useState } from 'react';
import { fetchMovies, type MovieListItem } from '../api';
import { MovieCard } from '../components/MovieCard';
import { MovieDetailModal } from '../components/MovieDetailModal';

const SORT_OPTIONS = [
  { value: 'releaseDate', label: 'Lançamento (mais recente)' },
  { value: 'popularity', label: 'Popularidade' },
  { value: 'voteAverage', label: 'Nota média' },
  { value: 'title', label: 'Título (A–Z)' },
];

export default function ListPage() {
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState('releaseDate');
  const [total, setTotal] = useState(0);
  const [items, setItems] = useState<MovieListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [detailTmdbId, setDetailTmdbId] = useState<number | null>(null);
  const pageSize = 36;

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchMovies({ page, pageSize, sort })
      .then((data) => {
        if (cancelled) return;
        setItems(data.items);
        setTotal(data.total);
      })
      .catch(() => {
        if (!cancelled) {
          setItems([]);
          setTotal(0);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [page, sort]);

  const pages = Math.max(1, Math.ceil(total / pageSize));
  const showPagination = !loading && pages > 1;

  return (
    <Stack gap="md">
      <Group justify="space-between" align="flex-end" wrap="wrap">
        <div>
          <Title order={2}>Todos os filmes</Title>
          <Text c="dimmed" size="sm" mt={4}>
            {total.toLocaleString('pt-BR')} títulos na base
          </Text>
        </div>
        <Select
          label="Ordenar"
          data={SORT_OPTIONS}
          value={sort}
          onChange={(v) => {
            setSort(v || 'releaseDate');
            setPage(1);
          }}
          w={280}
        />
      </Group>

      {showPagination && (
        <Group justify="center" w="100%">
          <Pagination value={page} onChange={setPage} total={pages} siblings={1} />
        </Group>
      )}

      {loading && (
        <Group justify="center" py="xl">
          <Loader />
        </Group>
      )}

      {!loading && (
        <Stack gap="sm">
          {items.map((m) => (
            <MovieCard
              key={m.tmdbId}
              movie={m}
              overviewLineClamp={2}
              showRuntime
              showCastLine
              onOpenDetail={() => setDetailTmdbId(m.tmdbId)}
            />
          ))}
        </Stack>
      )}

      <MovieDetailModal tmdbId={detailTmdbId} onClose={() => setDetailTmdbId(null)} />

      {showPagination && (
        <Group justify="center" w="100%" mt="md">
          <Pagination value={page} onChange={setPage} total={pages} siblings={1} />
        </Group>
      )}
    </Stack>
  );
}
