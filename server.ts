import express, { Request, Response } from 'express';
import path from 'path';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '10mb' }));

// Lazy Google GenAI Client
let genAIClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI | null {
  if (!genAIClient && process.env.GEMINI_API_KEY) {
    genAIClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return genAIClient;
}

// 1. Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'School Gallery & Athletics Hub API',
    timestamp: new Date().toISOString()
  });
});

// 2. Direct High-Resolution Download proxy endpoint
// Enables 1-click clean file download with proper Content-Disposition
app.get('/api/download', async (req: Request, res: Response) => {
  try {
    const { url, filename, resolution } = req.query;
    if (!url || typeof url !== 'string') {
      return res.status(400).json({ error: 'Missing target image url parameter' });
    }

    const safeFilename = typeof filename === 'string' && filename.length > 0 
      ? filename.replace(/[^a-zA-Z0-9_\-\.]/g, '_')
      : `Pinecrest_Athletics_${resolution || 'highres'}_${Date.now()}.jpg`;

    // Fetch the remote image stream
    const response = await fetch(url);
    if (!response.ok) {
      return res.status(response.status).json({ error: 'Failed to fetch asset from origin' });
    }

    const contentType = response.headers.get('content-type') || 'image/jpeg';
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${safeFilename}"`);

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    res.send(buffer);
  } catch (error) {
    console.error('Download proxy error:', error);
    res.status(500).json({ error: 'Internal download failure' });
  }
});

// 3. AI Smart Auto-Tagging & Photojournalism Caption Generator
// Secure server-side Gemini 3.8-flash integration
app.post('/api/ai/auto-tag', async (req: Request, res: Response) => {
  try {
    const { eventTitle, category, rawTags, description } = req.body;
    const ai = getGenAI();

    if (!ai) {
      // Fallback heuristic tags if GEMINI_API_KEY is not configured yet
      const fallbackTags = [
        category || 'Athletics',
        'Varsity',
        'Pinecrest High',
        'Action Shot',
        'High Resolution',
        'Student Media'
      ];
      return res.json({
        success: true,
        tags: fallbackTags,
        suggestedCaption: `${eventTitle || 'Pinecrest Athletic Match'}: High-intensity action captured by student photojournalists with crisp focus and full field coverage.`,
        suggestedExif: '1/2000s · f/2.8 · ISO 2500'
      });
    }

    const prompt = `You are a high school athletic director and chief sports photojournalist.
Analyze the following event and photo context:
Event Title: "${eventTitle || 'School Tournament'}"
Category: "${category || 'Sports'}"
Existing Tags or Notes: "${rawTags || 'None'}"
Current Description: "${description || ''}"

Return a JSON object with:
1. "tags": An array of 6 to 8 punchy, highly relevant tags (e.g. sport name, player terms, event context like "Buzzer Beater", "Homecoming", "Championship", "Defense", "Varsity").
2. "suggestedCaption": A dynamic, 1-2 sentence compelling athletic photo caption in newspaper style.
3. "suggestedExif": A realistic camera setting suggestion for this sport (e.g. "1/2500s · f/2.8 · ISO 3200").

Return ONLY valid JSON.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      }
    });

    const responseText = response.text || '{}';
    let parsedData = {};
    try {
      parsedData = JSON.parse(responseText);
    } catch {
      parsedData = {
        tags: [category || 'Athletics', 'Varsity', 'Action Shot', 'Championship'],
        suggestedCaption: `${eventTitle}: Peak action captured during the game.`,
        suggestedExif: '1/2000s · f/2.8 · ISO 2000'
      };
    }

    return res.json({
      success: true,
      ...parsedData
    });
  } catch (error) {
    console.error('AI Auto-Tagging error:', error);
    res.status(500).json({
      error: 'Failed to generate AI auto-tags',
      tags: ['Varsity', 'High School Sports', 'Action', 'Pinecrest Media']
    });
  }
});

// Vite middleware & production static file serving
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
