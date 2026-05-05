import express from 'express';
import mongoose from 'mongoose';
import { Movie } from '../models/Movie.js';

const router = express.Router();

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

router.get('/suggest', async (req, res) => {
  const q = String(req.query.q ?? '').trim();
  const limit = Math.min(Number(req.query.limit) || 12, 30);

  if (!q) {
    return res.json({ items: [] });
  }

  try {
    if (q.length >= 2) {
      const textResults = await Movie.find(
        { $text: { $search: q } },
        { score: { $meta: 'textScore' } }
      )
        .sort({ score: { $meta: 'textScore' } })
        .limit(limit)
        .select(
          'tmdbId title originalTitle releaseDate voteAverage tagline genreNames directorNames'
        )
        .lean();

      if (textResults.length > 0) {
        return res.json({
          items: textResults.map((m) => ({
            id: m.tmdbId,
            title: m.title,
            originalTitle: m.originalTitle,
            releaseDate: m.releaseDate,
            voteAverage: m.voteAverage,
            subtitle: [m.directorNames, m.genreNames].filter(Boolean).join(' · ') || m.tagline,
          })),
        });
      }
    }

    const rx = new RegExp(escapeRegex(q), 'i');
    const prefixRx = new RegExp(`^${escapeRegex(q)}`, 'i');
    const fallback = await Movie.find({
      $or: [{ title: rx }, { originalTitle: rx }],
    })
      .sort({ popularity: -1 })
      .limit(limit)
      .select(
        'tmdbId title originalTitle releaseDate voteAverage tagline genreNames directorNames popularity'
      )
      .lean();

    fallback.sort((a, b) => {
      const at = `${a.title} ${a.originalTitle || ''}`;
      const bt = `${b.title} ${b.originalTitle || ''}`;
      const aPref = prefixRx.test(a.title) || prefixRx.test(a.originalTitle || '') ? 0 : 1;
      const bPref = prefixRx.test(b.title) || prefixRx.test(b.originalTitle || '') ? 0 : 1;
      if (aPref !== bPref) return aPref - bPref;
      return (b.popularity || 0) - (a.popularity || 0);
    });

    return res.json({
      items: fallback.map((m) => ({
        id: m.tmdbId,
        title: m.title,
        originalTitle: m.originalTitle,
        releaseDate: m.releaseDate,
        voteAverage: m.voteAverage,
        subtitle: [m.directorNames, m.genreNames].filter(Boolean).join(' · ') || m.tagline,
      })),
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Erro na sugestão' });
  }
});

router.get('/search', async (req, res) => {
  const q = String(req.query.q ?? '').trim();
  const page = Math.max(1, Number(req.query.page) || 1);
  const pageSize = Math.min(Math.max(1, Number(req.query.pageSize) || 24), 100);

  if (!q) {
    return res.json({ items: [], total: 0, page, pageSize });
  }

  try {
    const filter = { $text: { $search: q } };
    const total = await Movie.countDocuments(filter);
    const items = await Movie.find(filter, { score: { $meta: 'textScore' } })
      .sort({ score: { $meta: 'textScore' } })
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .lean();

    if (total === 0) {
      const rx = new RegExp(escapeRegex(q), 'i');
      const altFilter = {
        $or: [
          { title: rx },
          { originalTitle: rx },
          { overview: rx },
          { tagline: rx },
          { genreNames: rx },
          { keywordNames: rx },
          { castNames: rx },
          { directorNames: rx },
        ],
      };
      const altTotal = await Movie.countDocuments(altFilter);
      const altItems = await Movie.find(altFilter)
        .sort({ popularity: -1 })
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .lean();
      return res.json({
        items: altItems,
        total: altTotal,
        page,
        pageSize,
        mode: 'fallback',
      });
    }

    return res.json({ items, total, page, pageSize, mode: 'text' });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Erro na busca' });
  }
});

router.get('/', async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const pageSize = Math.min(Math.max(1, Number(req.query.pageSize) || 48), 200);
  const sort = String(req.query.sort || 'releaseDate');

  const sortMap = {
    releaseDate: { releaseDate: -1, title: 1 },
    title: { title: 1 },
    popularity: { popularity: -1, title: 1 },
    voteAverage: { voteAverage: -1, voteCount: -1 },
  };
  const sortSpec = sortMap[sort] || sortMap.releaseDate;

  try {
    const total = await Movie.countDocuments();
    const items = await Movie.find()
      .sort(sortSpec)
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .select(
        'tmdbId title originalTitle overview tagline releaseDate runtime voteAverage voteCount popularity genres genreNames directorNames castPreview homepage status'
      )
      .lean();

    return res.json({ items, total, page, pageSize });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Erro ao listar filmes' });
  }
});

router.get('/:id', async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) {
    return res.status(400).json({ error: 'ID inválido' });
  }

  try {
    const doc = await Movie.findOne({ tmdbId: id }).lean();
    if (!doc) {
      return res.status(404).json({ error: 'Filme não encontrado' });
    }
    return res.json(doc);
  } catch (e) {
    if (e instanceof mongoose.Error.CastError) {
      return res.status(400).json({ error: 'ID inválido' });
    }
    console.error(e);
    return res.status(500).json({ error: 'Erro ao carregar filme' });
  }
});

export default router;
