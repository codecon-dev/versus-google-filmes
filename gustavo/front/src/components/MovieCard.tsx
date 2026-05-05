import { Link } from "react-router-dom";
import { Star } from "lucide-react";
import { Movie } from "@/lib/api";
import { PosterArt } from "./PosterArt";

export const MovieCard = ({ movie, index = 0 }: { movie: Movie; index?: number }) => {
  const year = movie.release_date?.slice(0, 4);
  const matchPct = Math.round(parseFloat(movie.score) * 100);

  return (
    <Link
      to={`/movie/${movie.id}`}
      state={{ movie }}
      className="group block animate-fade-up"
      style={{ animationDelay: `${Math.min(index * 60, 600)}ms` }}
    >
      <article className="relative">
        <div className="relative aspect-[2/3] overflow-hidden rounded-sm shadow-poster transition-transform duration-700 [transition-timing-function:var(--transition-cinema)] group-hover:-translate-y-2">
          <PosterArt title={movie.title} year={year} className="absolute inset-0" />
          <div className="absolute top-3 right-3 z-10 px-2 py-1 rounded-sm bg-background/80 backdrop-blur-md border border-primary/30 text-[10px] uppercase tracking-wider font-medium text-primary">
            {matchPct}% match
          </div>
        </div>
        <div className="pt-4 space-y-1">
          <div className="flex items-baseline justify-between gap-3">
            <h3 className="font-display text-xl text-foreground group-hover:text-primary transition-colors leading-tight">
              {movie.title}
            </h3>
            <span className="text-xs text-muted-foreground tabular-nums shrink-0">{year}</span>
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Star className="w-3 h-3 fill-primary text-primary" />
              <span className="tabular-nums">{parseFloat(movie.vote_average).toFixed(1)}</span>
            </span>
            <span className="opacity-50">·</span>
            <span className="truncate">{movie.director}</span>
          </div>
          <p className="text-xs text-muted-foreground/80 line-clamp-2 pt-1">
            {movie.overview}
          </p>
        </div>
      </article>
    </Link>
  );
};
