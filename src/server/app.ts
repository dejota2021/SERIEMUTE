import express from 'express';
import dotenv from 'dotenv';
import { generateContentScript, answerStrategyQuestion } from './gemini';

dotenv.config();

export const app = express();

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

export default app;
