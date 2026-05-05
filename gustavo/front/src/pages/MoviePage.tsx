import { useEffect } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { ArrowLeft, Star, Clock, Calendar, TrendingUp } from "lucide-react";
import { Movie } from "@/lib/api";
import { PosterArt } from "@/components/PosterArt";

const MoviePage = () => {
  const { id } = useParams();
  const location = useLocation();
  const movie = (location.state as { movie?: Movie } | null)?.movie;

  useEffect(() => {
    if (movie) document.title = `${movie.title} · Cinefarejo`;
  }, [movie]);

  if (!movie) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md px-6">
          <h1 className="font-display text-3xl mb-3">Filme não carregado</h1>
          <p className="text-muted-foreground mb-6">
            Os detalhes do filme #{id} precisam vir da página de busca. Volte e
            clique no filme novamente.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-primary hover:underline"
          >
            <ArrowLeft className="w-4 h-4" /> Voltar à busca
          </Link>
        </div>
      </div>
    );
  }

  const year = movie.release_date?.slice(0, 4);
  const matchPct = Math.round(parseFloat(movie.score) * 100);
  const hours = Math.floor(movie.runtime / 60);
  const mins = movie.runtime % 60;

  return (
    <div className="min-h-screen">
      {/* Cinematic backdrop */}
      <div className="absolute inset-x-0 top-0 h-[70vh] -z-10 overflow-hidden">
        <PosterArt title={movie.title} className="absolute inset-0 scale-110 blur-3xl opacity-40" large />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/70 to-background" />
      </div>

      <header className="container max-w-6xl py-6">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Voltar
        </Link>
      </header>

      <article className="container max-w-6xl pb-24">
        <div className="grid md:grid-cols-[300px_1fr] gap-10 lg:gap-16">
          {/* Poster */}
          <div className="animate-fade-up">
            <PosterArt
              title={movie.title}
              year={year}
              large
              className="aspect-[2/3] rounded-sm shadow-cinema"
            />
            <div className="mt-4 px-3 py-2 rounded-sm bg-card border border-primary/30 text-center">
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                Match semântico
              </div>
              <div className="font-display text-3xl gold-text">{matchPct}%</div>
            </div>
          </div>

          {/* Info */}
          <div className="animate-fade-up" style={{ animationDelay: "150ms" }}>
            <div className="flex flex-wrap gap-2 mb-4">
              {movie.genres.map((g) => (
                <span
                  key={g}
                  className="text-[10px] uppercase tracking-[0.2em] px-2.5 py-1 border border-primary/40 text-primary rounded-sm"
                >
                  {g}
                </span>
              ))}
            </div>

            <h1 className="font-display text-5xl md:text-7xl leading-[0.95] text-balance">
              {movie.title}
            </h1>
            {movie.original_title !== movie.title && (
              <p className="font-display italic text-xl text-muted-foreground mt-2">
                {movie.original_title}
              </p>
            )}

            {movie.tagline && (
              <p className="font-display italic text-2xl gold-text mt-6 text-balance">
                "{movie.tagline}"
              </p>
            )}

            <div className="flex flex-wrap gap-x-6 gap-y-3 mt-8 pt-8 border-t border-border/60 text-sm">
              <Stat icon={<Star className="w-4 h-4 fill-primary text-primary" />} label="Nota">
                {parseFloat(movie.vote_average).toFixed(1)}
                <span className="text-muted-foreground/60"> / 10</span>
                <span className="text-xs text-muted-foreground ml-1">
                  ({movie.vote_count.toLocaleString("pt-BR")})
                </span>
              </Stat>
              <Stat icon={<Calendar className="w-4 h-4" />} label="Lançamento">
                {new Date(movie.release_date).toLocaleDateString("pt-BR")}
              </Stat>
              <Stat icon={<Clock className="w-4 h-4" />} label="Duração">
                {hours}h {mins}min
              </Stat>
              <Stat icon={<TrendingUp className="w-4 h-4" />} label="Popularidade">
                {parseFloat(movie.popularity).toFixed(1)}
              </Stat>
            </div>

            <section className="mt-10">
              <h2 className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-3">
                Sinopse
              </h2>
              <p className="text-lg leading-relaxed text-foreground/90 text-balance">
                {movie.overview}
              </p>
            </section>

            <div className="grid sm:grid-cols-2 gap-8 mt-10">
              <section>
                <h2 className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-3">
                  Direção
                </h2>
                <p className="font-display text-xl">{movie.director}</p>
              </section>
              <section>
                <h2 className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-3">
                  Elenco principal
                </h2>
                <ul className="space-y-1">
                  {movie.cast_members.map((c) => (
                    <li key={c} className="text-foreground/90">
                      {c}
                    </li>
                  ))}
                </ul>
              </section>
            </div>

            {movie.keywords?.length > 0 && (
              <section className="mt-10 pt-8 border-t border-border/60">
                <h2 className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-3">
                  Palavras-chave
                </h2>
                <div className="flex flex-wrap gap-2">
                  {movie.keywords.map((k) => (
                    <span
                      key={k}
                      className="text-xs px-2.5 py-1 rounded-full bg-secondary text-secondary-foreground"
                    >
                      {k}
                    </span>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      </article>
    </div>
  );
};

const Stat = ({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) => (
  <div>
    <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
      {label}
    </div>
    <div className="flex items-center gap-1.5 font-medium tabular-nums">
      {icon}
      {children}
    </div>
  </div>
);

export default MoviePage;
