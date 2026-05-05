import {
  Anchor,
  Badge,
  Divider,
  Group,
  Loader,
  Modal,
  ScrollArea,
  SimpleGrid,
  Stack,
  Text,
} from '@mantine/core';
import { useEffect, useState, type ReactNode } from 'react';
import { fetchMovieById, type MovieDetail } from '../api';
import {
  formatReleaseDate,
  formatUsd,
  parseGenreList,
  parseKeywordList,
} from '../utils/movie';
import { GenreBadges } from './GenreBadges';
import { MovieRatingBadge } from './MovieRatingBadge';

type MovieDetailModalProps = {
  tmdbId: number | null;
  onClose: () => void;
};

function DetailBlock({ label, children }: { label: string; children: ReactNode }) {
  if (children == null || children === false) return null;
  return (
    <Stack gap={4}>
      <Text size="xs" fw={600} c="dimmed" tt="uppercase">
        {label}
      </Text>
      <div>{children}</div>
    </Stack>
  );
}

export function MovieDetailModal({ tmdbId, onClose }: MovieDetailModalProps) {
  const opened = tmdbId != null;
  const [data, setData] = useState<MovieDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (tmdbId == null) {
      setData(null);
      setError(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    setData(null);
    fetchMovieById(tmdbId)
      .then((doc) => {
        if (!cancelled) setData(doc);
      })
      .catch((e: Error) => {
        if (!cancelled) setError(e.message || 'Erro ao carregar');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [tmdbId]);

  const keywords = data ? parseKeywordList(data.keywordNames) : [];

  const title =
    loading && opened ? 'Carregando…' : (data?.title ?? (error ? 'Erro' : 'Filme'));

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={title}
      size="lg"
      centered
      scrollAreaComponent={ScrollArea.Autosize}
      styles={{ title: { fontWeight: 700, fontSize: '1.15rem' } }}
    >
      {loading && (
        <Group justify="center" py="xl">
          <Loader />
        </Group>
      )}

      {error && !loading && (
        <Text c="red" size="sm">
          {error}
        </Text>
      )}

      {data && !loading && (
        <Stack gap="md">
          {data.originalTitle && data.originalTitle !== data.title && (
            <Text size="sm" c="dimmed">
              Título original: {data.originalTitle}
            </Text>
          )}

          {data.tagline ? (
            <Text size="sm" fs="italic" c="dimmed">
              {data.tagline}
            </Text>
          ) : null}

          <Group gap="sm" wrap="wrap" align="center">
            <MovieRatingBadge voteAverage={data.voteAverage} />
            {data.voteCount != null && data.voteCount > 0 && (
              <Text size="sm" c="dimmed">
                {data.voteCount.toLocaleString('pt-BR')} votos
              </Text>
            )}
            {data.popularity != null && (
              <Text size="sm" c="dimmed">
                Popularidade: {data.popularity.toFixed(1)}
              </Text>
            )}
          </Group>

          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
            <DetailBlock label="Lançamento">
              <Text size="sm">{formatReleaseDate(data.releaseDate)}</Text>
            </DetailBlock>
            <DetailBlock label="Duração">
              <Text size="sm">{data.runtime != null ? `${data.runtime} min` : '—'}</Text>
            </DetailBlock>
            <DetailBlock label="Estado">
              <Text size="sm">{data.status || '—'}</Text>
            </DetailBlock>
            <DetailBlock label="Idioma original">
              <Text size="sm">{data.originalLanguage?.toUpperCase() || '—'}</Text>
            </DetailBlock>
          </SimpleGrid>

          {parseGenreList(data.genreNames).length > 0 ? (
            <DetailBlock label="Gêneros">
              <GenreBadges genreNames={data.genreNames} justify="flex-start" />
            </DetailBlock>
          ) : null}

          {data.directorNames ? (
            <DetailBlock label="Direção">
              <Text size="sm">{data.directorNames}</Text>
            </DetailBlock>
          ) : null}

          {data.castPreview && data.castPreview.length > 0 ? (
            <DetailBlock label="Elenco (principal)">
              <Stack gap={6}>
                {data.castPreview.map((c, i) => (
                  <Group key={`${c.name}-${i}`} gap="xs" wrap="wrap" align="flex-start">
                    <Text size="sm" fw={500} style={{ minWidth: '7rem' }}>
                      {c.name || '—'}
                    </Text>
                    {c.character ? (
                      <Text size="sm" c="dimmed">
                        como {c.character}
                      </Text>
                    ) : null}
                  </Group>
                ))}
              </Stack>
            </DetailBlock>
          ) : null}

          {data.castNames && (!data.castPreview || data.castPreview.length === 0) ? (
            <DetailBlock label="Elenco">
              <Text size="sm">{data.castNames}</Text>
            </DetailBlock>
          ) : null}

          {data.overview ? (
            <DetailBlock label="Sinopse">
              <Text size="sm" style={{ lineHeight: 1.65 }}>
                {data.overview}
              </Text>
            </DetailBlock>
          ) : null}

          {keywords.length > 0 ? (
            <DetailBlock label="Palavras-chave">
              <Group gap={6} wrap="wrap">
                {keywords.map((kw, i) => (
                  <Badge key={`${kw}-${i}`} variant="dot" color="gray" size="sm">
                    {kw}
                  </Badge>
                ))}
              </Group>
            </DetailBlock>
          ) : null}

          {(data.budget != null && data.budget > 0) || (data.revenue != null && data.revenue > 0) ? (
            <>
              <Divider />
              <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                <DetailBlock label="Orçamento">
                  <Text size="sm">{formatUsd(data.budget)}</Text>
                </DetailBlock>
                <DetailBlock label="Bilheteria">
                  <Text size="sm">{formatUsd(data.revenue)}</Text>
                </DetailBlock>
              </SimpleGrid>
            </>
          ) : null}

          {data.homepage ? (
            <DetailBlock label="Site">
              <Anchor href={data.homepage} size="sm" target="_blank" rel="noopener noreferrer">
                {data.homepage}
              </Anchor>
            </DetailBlock>
          ) : null}

          <Text size="xs" c="dimmed">
            TMDB ID: {data.tmdbId}
          </Text>
        </Stack>
      )}
    </Modal>
  );
}
