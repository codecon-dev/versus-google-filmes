interface Props {
  title: string;
  year?: string;
  className?: string;
  large?: boolean;
}

// Deterministic gradient pair from the title
const palettes = [
  ["14 70% 35%", "30 20% 8%", "38 60% 30%"],
  ["220 50% 25%", "30 14% 6%", "38 70% 40%"],
  ["350 55% 30%", "20 20% 8%", "30 60% 35%"],
  ["180 40% 20%", "30 14% 6%", "38 55% 35%"],
  ["280 40% 25%", "30 14% 6%", "14 65% 40%"],
  ["38 65% 40%", "30 14% 6%", "14 50% 25%"],
  ["140 35% 22%", "30 14% 6%", "38 60% 35%"],
];

function hash(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

export const PosterArt = ({ title, year, className = "", large = false }: Props) => {
  const p = palettes[hash(title) % palettes.length];
  const bg = `linear-gradient(135deg, hsl(${p[0]}) 0%, hsl(${p[1]}) 55%, hsl(${p[2]}) 100%)`;
  const initials = title
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 3)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  return (
    <div
      className={`relative overflow-hidden grain flex items-center justify-center ${className}`}
      style={{ background: bg }}
    >
      <div className="absolute inset-0 bg-gradient-film opacity-70" />
      <div className="absolute top-0 inset-x-0 flex items-center justify-between p-5 text-[10px] uppercase tracking-[0.25em] text-foreground/60 font-medium">
        <span>Cinefarejo</span>
        {year && <span>{year}</span>}
      </div>

      <div className="relative z-10 px-6 text-center">
        <div
          className="mx-auto mb-4 flex items-center justify-center rounded-full border border-primary/40 bg-background/40 backdrop-blur-sm"
          style={{ width: large ? 96 : 56, height: large ? 96 : 56 }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className={`text-primary ${large ? "w-12 h-12" : "w-7 h-7"}`}
          >
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8.5" cy="9" r="1.5" />
            <path d="m21 15-5-5L5 21" />
          </svg>
        </div>
        <p
          className={`font-display italic text-foreground/90 leading-snug text-balance ${
            large ? "text-2xl md:text-3xl" : "text-sm"
          }`}
          style={{ textShadow: "0 2px 20px rgba(0,0,0,0.6)" }}
        >
          era pra ter uma imagem aqui
        </p>
      </div>

      <div className="absolute bottom-0 inset-x-0 p-5 text-[10px] uppercase tracking-[0.3em] text-foreground/50 truncate text-center">
        {title}
      </div>
    </div>
  );
};
