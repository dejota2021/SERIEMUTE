import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { generateContentScript, answerStrategyQuestion } from './src/server/gemini.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  app.use(express.json());

  // API Endpoints for AI features
  app.post('/api/generate-script', async (req, res) => {
    try {
      const script = await generateContentScript(req.body);
      res.json({ success: true, script });
    } catch (err: any) {
      console.error('[Server API] Error generating script:', err);
      res.status(500).json({
        success: false,
        error: err?.message || 'Error al generar el guión con la IA.',
      });
    }
  });

  app.post('/api/strategy-assistant', async (req, res) => {
    try {
      const question = req.body?.question || '';
      const answer = await answerStrategyQuestion(question);
      res.json({ success: true, answer });
    } catch (err: any) {
      console.error('[Server API] Error in strategy assistant:', err);
      res.status(500).json({
        success: false,
        error: err?.message || 'Error al consultar la IA de estrategia.',
      });
    }
  });

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', service: 'dejota-mute-studio' });
  });

  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
