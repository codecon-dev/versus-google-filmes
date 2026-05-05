import { Badge, Card, Group, Stack, Text } from '@mantine/core';
import type { MovieListItem } from '../api';
import { formatYear } from '../utils/movie';
import { GenreBadges } from './GenreBadges';
import { MovieRatingBadge } from './MovieRatingBadge';

export type MovieCardProps = {
  movie: MovieListItem;
  overviewLineClamp?: 2 | 3;
  showRuntime?: boolean;
  showCastLine?: boolean;
  onOpenDetail?: () => void;
};

export function MovieCard({
  movie: m,
  overviewLineClamp = 3,
  showRuntime = false,
  showCastLine = false,
  onOpenDetail,
}: MovieCardProps) {
  const year = formatYear(m.releaseDate);
  const interactive = Boolean(onOpenDetail);

  return (
    <Card
      withBorder
      padding="md"
      radius="md"
      onClick={onOpenDetail}
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
      onKeyDown={
        interactive
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onOpenDetail?.();
              }
            }
          : undefined
      }
      aria-label={interactive ? `Abrir detalhes: ${m.title}` : undefined}
      styles={{
        root: {
          cursor: interactive ? 'pointer' : undefined,
          transition: interactive ? 'box-shadow 120ms ease, border-color 120ms ease' : undefined,
        },
      }}
    >
      <Group justify="space-between" align="flex-start" wrap="nowrap" gap="md">
        <Stack gap={6} style={{ flex: 1, minWidth: 0 }}>
          <Group gap="xs" wrap="wrap" align="center">
            <Text fw={600}>{m.title}</Text>
            {m.originalTitle && m.originalTitle !== m.title && (
              <Text size="sm" c="dimmed">
                {m.originalTitle}
              </Text>
            )}
            {year && <Badge variant="light">{year}</Badge>}
            {showRuntime && m.runtime != null && (
              <Badge variant="outline">{m.runtime} min</Badge>
            )}
          </Group>
          {m.directorNames && (
            <Text size="sm" c="dimmed">
              {m.directorNames}
            </Text>
          )}
          {showCastLine && m.castPreview && m.castPreview.length > 0 && (
            <Text size="xs" c="dimmed">
              {m.castPreview
                .map((c) => c.name)
                .filter(Boolean)
                .join(', ')}
            </Text>
          )}
          {m.overview && (
            <Text size="sm" lineClamp={overviewLineClamp}>
              {m.overview}
            </Text>
          )}
        </Stack>
        <Stack gap="xs" align="flex-end" style={{ flexShrink: 0 }}>
          <GenreBadges genreNames={m.genreNames} />
          <MovieRatingBadge voteAverage={m.voteAverage} />
        </Stack>
      </Group>
    </Card>
  );
}
