import mongoose from 'mongoose';

const genreSchema = new mongoose.Schema(
  {
    id: Number,
    name: String,
  },
  { _id: false }
);

const castPreviewSchema = new mongoose.Schema(
  {
    name: String,
    character: String,
  },
  { _id: false }
);

const movieSchema = new mongoose.Schema(
  {
    tmdbId: { type: Number, required: true, unique: true, index: true },
    title: { type: String, required: true },
    originalTitle: String,
    overview: String,
    tagline: String,
    releaseDate: Date,
    runtime: Number,
    voteAverage: Number,
    voteCount: Number,
    popularity: Number,
    genres: [genreSchema],
    genreNames: String,
    keywordNames: String,
    castPreview: [castPreviewSchema],
    castNames: String,
    directorNames: String,
    homepage: String,
    status: String,
    budget: Number,
    revenue: Number,
    originalLanguage: String,
  },
  { timestamps: true }
);

movieSchema.index(
  {
    title: 'text',
    originalTitle: 'text',
    tagline: 'text',
    overview: 'text',
    genreNames: 'text',
    keywordNames: 'text',
    castNames: 'text',
    directorNames: 'text',
  },
  {
    weights: {
      title: 10,
      originalTitle: 8,
      tagline: 6,
      genreNames: 4,
      keywordNames: 3,
      castNames: 5,
      directorNames: 5,
      overview: 1,
    },
    name: 'movie_text_index',
  }
);

movieSchema.index({ title: 1 });
movieSchema.index({ releaseDate: -1 });
movieSchema.index({ popularity: -1 });
movieSchema.index({ voteAverage: -1 });

export const Movie = mongoose.model('Movie', movieSchema);
