import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import moviesRouter from './routes/movies.js';

const PORT = Number(process.env.PORT) || 3001;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/filmes';

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

app.use('/api/movies', moviesRouter);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'Erro interno' });
});

async function main() {
  await mongoose.connect(MONGODB_URI);
  console.log('MongoDB conectado');
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`API em http://0.0.0.0:${PORT}`);
  });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
