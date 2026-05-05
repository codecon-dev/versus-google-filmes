import { Badge, Group } from '@mantine/core';
import { getGenreColor } from '../constants/genreColors';
import { parseGenreList } from '../utils/movie';

type GenreBadgesProps = {
  genreNames?: string;
  /** Alinhamento dos badges (no card do filme usa-se o padrão à direita). */
  justify?: 'flex-start' | 'flex-end' | 'center';
};

export function GenreBadges({ genreNames, justify = 'flex-end' }: GenreBadgesProps) {
  const genres = parseGenreList(genreNames);
  if (genres.length === 0) return null;

  return (
    <Group gap={6} wrap="wrap" justify={justify}>
      {genres.map((label, i) => (
        <Badge
          key={`${label}-${i}`}
          color={getGenreColor(label)}
          variant="outline"
          styles={{ root: { textTransform: 'none', backgroundColor: 'transparent' } }}
        >
          {label}
        </Badge>
      ))}
    </Group>
  );
}
