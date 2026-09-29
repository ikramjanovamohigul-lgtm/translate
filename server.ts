import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import { translateText } from './src/lib/translator.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;
  const isProduction = process.env.NODE_ENV === 'production';

  app.use(express.json());

  // Health check endpoint
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', service: 'AI Translator' });
  });

  // Translation endpoint
  app.post('/api/translate', async (req, res) => {
    try {
      const { text, sourceLanguage, targetLanguage } = req.body;

      if (!text || typeof text !== 'string' || !text.trim()) {
        return res.status(400).json({ error: 'Please enter some text.' });
      }

      if (!sourceLanguage || !targetLanguage) {
        return res.status(400).json({ error: 'Both source and target languages are required.' });
      }

      const translation = await translateText(text, sourceLanguage, targetLanguage);
      return res.json({ translation });
    } catch (err: any) {
      console.error('Translation error:', err);
      return res.status(500).json({
        error: 'Translation failed. Please try again.',
        details: err?.message || 'Internal translation service error',
      });
    }
  });

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
