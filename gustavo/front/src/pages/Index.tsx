import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { AlertCircle } from "lucide-react";
import logo from "/favicon.png";
import { searchMovies } from "@/lib/api";
import { SearchBar } from "@/components/SearchBar";
import { MovieCard } from "@/components/MovieCard";

const Index = () => {
  const [query, setQuery] = useState("");

  const mutation = useMutation({
    mutationFn: (q: string) => searchMovies(q),
  });

  const handleSearch = (q: string) => {
    setQuery(q);
    mutation.mutate(q);
  };

  const hasResults = mutation.data && mutation.data.data.length > 0;
  const hasSearched = mutation.isSuccess || mutation.isError;

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-border/60">
        <div className="container max-w-6xl flex items-center justify-between py-5">
          <div className="flex items-center gap-2.5">
            <img
              src={logo}
              alt="Cinefarejo"
              width={32}
              height={32}
              className="w-9 h-9 object-contain"
            />
            <span className="font-display text-xl tracking-tight">Cinefarejo</span>
          </div>
          <nav className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
            Busca semântica de filmes
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section
        className={`container max-w-4xl transition-all duration-700 ${
          hasSearched ? "py-12" : "py-24 md:py-32"
        }`}
      >
        {!hasSearched && (
          <div className="text-center mb-10 animate-fade-up">
            <p className="text-xs uppercase tracking-[0.4em] text-primary/80 mb-6">
              · Encontre o filme certo pela sensação ·
            </p>
            <h1 className="font-display text-5xl md:text-7xl lg:text-8xl leading-[0.95] text-balance">
              O cinema que você <em className="gold-text not-italic">sente</em>,
              <br /> mesmo sem saber o nome.
            </h1>
            <p className="mt-6 text-base md:text-lg text-muted-foreground max-w-xl mx-auto">
              Descreva uma atmosfera, um sentimento, uma cena imaginada. Nós
              farejamos o filme por você.
            </p>
          </div>
        )}

        <div className={hasSearched ? "" : "animate-fade-up"} style={{ animationDelay: "200ms" }}>
          <SearchBar
            initialValue={query}
            loading={mutation.isPending}
            onSearch={handleSearch}
          />
        </div>
      </section>

      {/* Results */}
      <section className="container max-w-6xl pb-24">
        {mutation.isPending && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[2/3] bg-muted/40 rounded-sm" />
                <div className="mt-4 h-4 bg-muted/40 rounded w-3/4" />
                <div className="mt-2 h-3 bg-muted/30 rounded w-1/2" />
              </div>
            ))}
          </div>
        )}

        {mutation.isError && (
          <div className="border border-destructive/40 bg-destructive/10 rounded-sm p-6 flex gap-4 items-start">
            <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
            <div>
              <h3 className="font-display text-lg mb-1">Não consegui farejar nada.</h3>
              <p className="text-sm text-muted-foreground">
                {(mutation.error as Error).message}. Verifique se o backend está
                rodando em <code className="text-primary">localhost:8000</code>.
              </p>
            </div>
          </div>
        )}

        {hasResults && (
          <>
            <div className="flex items-baseline justify-between mb-8 pb-4 border-b border-border/60">
              <h2 className="font-display text-2xl">
                <span className="text-muted-foreground">Resultados para</span>{" "}
                <em className="gold-text not-italic">"{mutation.data!.query.replace(/\+/g, " ")}"</em>
              </h2>
              <span className="text-xs uppercase tracking-widest text-muted-foreground tabular-nums">
                {mutation.data!.count} filmes
              </span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12">
              {mutation.data!.data.map((m, i) => (
                <MovieCard key={m.id} movie={m} index={i} />
              ))}
            </div>
          </>
        )}

        {mutation.isSuccess && !hasResults && (
          <div className="text-center py-20 text-muted-foreground">
            Nada encontrado para essa descrição. Tente outras palavras.
          </div>
        )}
      </section>

      <footer className="border-t border-border/60 py-8 text-center text-xs uppercase tracking-[0.3em] text-muted-foreground/60">
        Cinefarejo · busca semântica
      </footer>
    </div>
  );
};

export default Index;
