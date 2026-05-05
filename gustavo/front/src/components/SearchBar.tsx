import { Search, Loader2 } from "lucide-react";
import { FormEvent, useState } from "react";

interface Props {
  initialValue?: string;
  loading?: boolean;
  onSearch: (q: string) => void;
}

const suggestions = [
  "filme melancólico sobre solidão urbana",
  "thriller psicológico anos 70",
  "comédia romântica com final agridoce",
  "ficção científica filosófica",
];

export const SearchBar = ({ initialValue = "", loading, onSearch }: Props) => {
  const [value, setValue] = useState(initialValue);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (value.trim()) onSearch(value.trim());
  };

  return (
    <div className="w-full">
      <form onSubmit={submit} className="relative group">
        <div className="absolute inset-0 bg-gradient-gold opacity-0 group-focus-within:opacity-30 blur-xl transition-opacity duration-700" />
        <div className="relative flex items-center gap-3 bg-card/80 backdrop-blur-xl border border-border group-focus-within:border-primary/60 rounded-sm px-5 py-4 transition-colors">
          <Search className="w-5 h-5 text-muted-foreground shrink-0" />
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="descreva o filme que você procura..."
            className="flex-1 bg-transparent outline-none text-base md:text-lg placeholder:text-muted-foreground/60 font-light"
            autoFocus
          />
          <button
            type="submit"
            disabled={loading || !value.trim()}
            className="shrink-0 px-5 py-2 rounded-sm bg-primary text-primary-foreground text-sm font-medium uppercase tracking-wider disabled:opacity-40 hover:bg-primary/90 transition-colors flex items-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Farejar"}
          </button>
        </div>
      </form>
      <div className="flex flex-wrap gap-2 mt-4">
        <span className="text-xs uppercase tracking-widest text-muted-foreground/70 mr-1 self-center">
          Tente:
        </span>
        {suggestions.map((s) => (
          <button
            key={s}
            onClick={() => {
              setValue(s);
              onSearch(s);
            }}
            className="text-xs px-3 py-1.5 rounded-full border border-border hover:border-primary/60 hover:text-primary text-muted-foreground transition-colors"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
};
