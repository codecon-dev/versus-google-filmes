import { Badge } from '@mantine/core';
import { IconStarFilled } from '@tabler/icons-react';

type MovieRatingBadgeProps = {
  voteAverage?: number | null;
};

export function MovieRatingBadge({ voteAverage }: MovieRatingBadgeProps) {
  if (voteAverage == null) return null;
  return (
    <Badge color="yellow" variant="outline" leftSection={<IconStarFilled size={14} />}>
      {voteAverage.toFixed(1)}
    </Badge>
  );
}
