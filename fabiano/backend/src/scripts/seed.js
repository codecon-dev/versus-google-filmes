import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from 'csv-parse/sync';
import mongoose from 'mongoose';
import { Movie } from '../models/Movie.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function safeJsonParse(str, fallback) {
  if (str == null || str === '') return fallback;
  try {
    return JSON.parse(str);
  } catch {
    return fallback;
  }
}

function directorsFromCrew(crew) {
  if (!Array.isArray(crew)) return '';
  const names = crew
    .filter((c) => c.job === 'Director')
    .map((c) => c.name)
    .filter(Boolean);
  return [...new Set(names)].join(', ');
}

function topCastNames(cast, n = 10) {
  if (!Array.isArray(cast)) return '';
  return cast
    .slice(0, n)
    .map((c) => c.name)
    .filter(Boolean)
    .join(', ');
}

function castPreview(cast, n = 5) {
  if (!Array.isArray(cast)) return [];
  return cast.slice(0, n).map((c) => ({
    name: c.name,
    character: c.character,
  }));
}

function keywordNamesFromRow(keywordsCell) {
  const k = safeJsonParse(keywordsCell, []);
  if (!Array.isArray(k)) return '';
  return k.map((x) => x.name).filter(Boolean).join(', ');
}

function num(s) {
  const n = Number(s);
  return Number.isFinite(n) ? n : undefined;
}

async function main() {
  const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/filmes';
  const DATA_DIR =
    process.env.DATA_DIR || path.join(__dirname, '..', '..', '..', 'database_filmes');
  const force = process.env.FORCE_SEED === '1';

  await mongoose.connect(MONGODB_URI);

  const count = await Movie.countDocuments();
  if (count > 0 && !force) {
    console.log(`Seed ignorado: já existem ${count} filmes (FORCE_SEED=1 para recriar).`);
    await mongoose.disconnect();
    process.exit(0);
  }

  const moviesPath = path.join(DATA_DIR, 'tmdb_5000_movies.csv');
  const creditsPath = path.join(DATA_DIR, 'tmdb_5000_credits.csv');

  if (!fs.existsSync(moviesPath) || !fs.existsSync(creditsPath)) {
    console.error('CSV não encontrado em', DATA_DIR);
    await mongoose.disconnect();
    process.exit(1);
  }

  console.log('Lendo créditos…');
  const creditsRaw = parse(fs.readFileSync(creditsPath, 'utf8'), {
    columns: true,
    skip_empty_lines: true,
    relax_quotes: true,
    relax_column_count: true,
  });

  const creditsByMovie = new Map();
  for (const row of creditsRaw) {
    const mid = num(row.movie_id);
    if (mid == null) continue;
    creditsByMovie.set(mid, {
      cast: safeJsonParse(row.cast, []),
      crew: safeJsonParse(row.crew, []),
    });
  }

  console.log('Lendo filmes…');
  const moviesRaw = parse(fs.readFileSync(moviesPath, 'utf8'), {
    columns: true,
    skip_empty_lines: true,
    relax_quotes: true,
    relax_column_count: true, 
  });

  const docs = [];

  for (const row of moviesRaw) {
    const tmdbId = num(row.id);
    if (tmdbId == null) continue;

    const cred = creditsByMovie.get(tmdbId) || { cast: [], crew: [] };
    const genres = safeJsonParse(row.genres, []);
    const genreList = Array.isArray(genres)
      ? genres.map((g) => ({ id: g.id, name: g.name }))
      : [];
    const genreNames = genreList.map((g) => g.name).filter(Boolean).join(', ');

    let releaseDate;
    if (row.release_date) {
      const d = new Date(row.release_date);
      releaseDate = Number.isNaN(d.getTime()) ? undefined : d;
    }

    docs.push({
      tmdbId,
      title: row.title || '',
      originalTitle: row.original_title || '',
      overview: row.overview || '',
      tagline: row.tagline || '',
      releaseDate,
      runtime: num(row.runtime),
      voteAverage: num(row.vote_average),
      voteCount: num(row.vote_count),
      popularity: num(row.popularity),
      genres: genreList,
      genreNames,
      keywordNames: keywordNamesFromRow(row.keywords),
      castPreview: castPreview(cred.cast),
      castNames: topCastNames(cred.cast),
      directorNames: directorsFromCrew(cred.crew),
      homepage: row.homepage || '',
      status: row.status || '',
      budget: num(row.budget),
      revenue: num(row.revenue),
      originalLanguage: row.original_language || '',
    });
  }

  if (force && count > 0) {
    await Movie.deleteMany({});
    console.log('Coleção limpa (FORCE_SEED).');
  }

  console.log(`Inserindo ${docs.length} filmes…`);
  await Movie.insertMany(docs, { ordered: false });
  console.log('Seed concluído.');
  await mongoose.disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
