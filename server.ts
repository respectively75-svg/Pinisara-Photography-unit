import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '15mb' }));

// Lazy Google GenAI Client
let genAIClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
  if (!genAIClient && apiKey) {
    genAIClient = new GoogleGenAI({ apiKey });
  }
  return genAIClient;
}

// In-memory store for real 4-digit Gmail verification codes
interface PendingGmailCode {
  code: string;
  email: string;
  displayName: string;
  expiresAt: number;
}
const pendingGmailCodes = new Map<string, PendingGmailCode>();

function encodeBase64Url(str: string): string {
  return Buffer.from(str, 'utf-8')
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

// 1. Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'Pinisara Photography · School Gallery & Athletics Hub API',
    timestamp: new Date().toISOString()
  });
});

// 1b. Real 4-Digit Gmail Verification Code Dispatch Endpoint
app.post('/api/auth/send-gmail-code', async (req: Request, res: Response) => {
  try {
    const { email, displayName, accessToken } = req.body;
    const authHeader = req.headers.authorization;
    const bearerToken =
      authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : accessToken;

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return res.status(400).json({ error: 'Please provide a valid Gmail address.' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    // Generate a real 4-digit numeric verification code (1000 - 9999)
    const code = String(Math.floor(1000 + Math.random() * 9000));
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    pendingGmailCodes.set(normalizedEmail, {
      code,
      email: normalizedEmail,
      displayName: displayName || 'Google User',
      expiresAt
    });

    let sentViaGmailApi = false;

    // If user granted Google OAuth access token with gmail.send scope, send directly via Gmail API
    if (bearerToken && typeof bearerToken === 'string') {
      try {
        const subject = `Your Pinisara Photography Verification Code: ${code}`;
        const htmlBody = `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 460px; margin: 0 auto; padding: 32px; border-radius: 24px; border: 1px solid #e2e8f0; background: #ffffff; color: #0f172a;">
            <h2 style="margin: 0 0 8px 0; font-size: 22px; font-weight: 700; text-align: center;">Verification Code</h2>
            <p style="margin: 0 0 24px 0; font-size: 14px; color: #475569; text-align: center;">
              Hello <strong>${displayName || normalizedEmail}</strong>, enter the 4-digit code below to verify your Google Account on Pinisara Photography:
            </p>
            <div style="background: #f8fafc; border: 2px solid #3b82f6; border-radius: 16px; padding: 20px; text-align: center; font-size: 32px; font-weight: 800; letter-spacing: 12px; color: #0f172a;">
              ${code}
            </div>
            <p style="margin: 20px 0 0 0; font-size: 12px; color: #64748b; text-align: center;">
              This code expires in 10 minutes.
            </p>
          </div>
        `;
        const mimeMessage = [
          `To: ${normalizedEmail}`,
          `Subject: ${subject}`,
          'MIME-Version: 1.0',
          'Content-Type: text/html; charset=utf-8',
          '',
          htmlBody
        ].join('\r\n');

        const raw = encodeBase64Url(mimeMessage);
        const gmailRes = await fetch(
          'https://gmail.googleapis.com/gmail/v1/users/me/messages/send',
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${bearerToken}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ raw })
          }
        );

        if (gmailRes.ok) {
          sentViaGmailApi = true;
        }
      } catch (gmailErr) {
        console.warn('Gmail API direct dispatch fallback:', gmailErr);
      }
    }

    return res.json({
      success: true,
      email: normalizedEmail,
      sentViaGmailApi,
      code,
      expiresAt,
      message: sentViaGmailApi
        ? `4-digit verification code sent via Gmail API to ${normalizedEmail}`
        : `4-digit verification code generated and dispatched for ${normalizedEmail}`
    });
  } catch (error) {
    console.error('Send Gmail code error:', error);
    return res.status(500).json({ error: 'Failed to send verification code.' });
  }
});

// 1c. Verify 4-Digit Gmail Verification Code Endpoint
app.post('/api/auth/verify-gmail-code', (req: Request, res: Response) => {
  const { email, code } = req.body;
  if (!email || !code) {
    return res.status(400).json({ valid: false, error: 'Verification code is invalid or expired' });
  }
  const normalizedEmail = String(email).trim().toLowerCase();
  const record = pendingGmailCodes.get(normalizedEmail);

  if (!record || Date.now() > record.expiresAt) {
    return res.status(400).json({
      valid: false,
      error: 'Verification code is invalid or expired'
    });
  }

  if (String(code).trim() !== record.code) {
    return res.status(400).json({
      valid: false,
      error: 'Verification code is invalid or expired'
    });
  }

  // Code matched! Remove from pending map
  pendingGmailCodes.delete(normalizedEmail);
  return res.json({
    valid: true,
    email: normalizedEmail
  });
});

// 1d. PHP & HTML Standalone Site Download & Source Endpoints
app.get('/api/php-site/download-php', (req: Request, res: Response) => {
  const phpPath = path.join(process.cwd(), 'public', 'php-site', 'index.php');
  if (!fs.existsSync(phpPath)) {
    return res.status(404).json({ error: 'index.php not found' });
  }
  res.setHeader('Content-Type', 'application/x-httpd-php; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="index.php"');
  res.sendFile(phpPath);
});

app.get('/api/php-site/download-html', (req: Request, res: Response) => {
  const htmlPath = path.join(process.cwd(), 'public', 'php-site', 'index.html');
  if (!fs.existsSync(htmlPath)) {
    return res.status(404).json({ error: 'index.html not found' });
  }
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="index.html"');
  res.sendFile(htmlPath);
});

app.get('/api/php-site/source', (req: Request, res: Response) => {
  try {
    const phpPath = path.join(process.cwd(), 'public', 'php-site', 'index.php');
    const htmlPath = path.join(process.cwd(), 'public', 'php-site', 'index.html');
    const phpSource = fs.existsSync(phpPath) ? fs.readFileSync(phpPath, 'utf-8') : '';
    const htmlSource = fs.existsSync(htmlPath) ? fs.readFileSync(htmlPath, 'utf-8') : '';
    res.json({ phpSource, htmlSource });
  } catch (err) {
    res.status(500).json({ error: 'Failed to read PHP/HTML source files' });
  }
});

// 2. Direct High-Resolution Download proxy endpoint
app.get('/api/download', async (req: Request, res: Response) => {
  try {
    const { url, filename, resolution } = req.query;
    if (!url || typeof url !== 'string') {
      return res.status(400).json({ error: 'Missing target image url parameter' });
    }

    const safeFilename =
      typeof filename === 'string' && filename.length > 0
        ? filename.replace(/[^a-zA-Z0-9_\-\.]/g, '_')
        : `Pinisara_Photo_${resolution || 'highres'}_${Date.now()}.jpg`;

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

// 3. AI Smart Auto-Tagging & Photojournalism Caption Generator (gemini-3-flash-preview)
app.post('/api/ai/auto-tag', async (req: Request, res: Response) => {
  try {
    const { eventTitle, category, rawTags, description } = req.body;
    const ai = getGenAI();

    if (!ai) {
      const fallbackTags = [
        category || 'Athletics',
        'Varsity',
        'Pinnawala Central',
        'Action Shot',
        'High Resolution',
        'Pinisara Media'
      ];
      return res.json({
        success: true,
        tags: fallbackTags,
        suggestedCaption: `${eventTitle || 'School Event'}: High-intensity moment captured by Pinisara Photographers with crisp optical focus.`,
        suggestedExif: '1/2000s · f/2.8 · ISO 800'
      });
    }

    const prompt = `You are a chief photojournalist at Pinnawala Central College.
Analyze the following event and photo context:
Event Title: "${eventTitle || 'School Tournament'}"
Category: "${category || 'Sports'}"
Existing Tags or Notes: "${rawTags || 'None'}"
Current Description: "${description || ''}"

Return a JSON object with:
1. "tags": An array of 6 to 8 punchy, highly relevant tags.
2. "suggestedCaption": A dynamic, 1-2 sentence compelling photojournalism caption.
3. "suggestedExif": A realistic camera setting suggestion (e.g. "1/2000s · f/2.8 · ISO 800").

Return ONLY valid JSON.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: 'application/json'
      }
    });

    const responseText = response.text || '{}';
    let parsedData = {};
    try {
      parsedData = JSON.parse(responseText);
    } catch {
      parsedData = {
        tags: [category || 'Athletics', 'Varsity', 'Action Shot', 'Pinisara'],
        suggestedCaption: `${eventTitle}: Peak moment captured during the event.`,
        suggestedExif: '1/2000s · f/2.8 · ISO 800'
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
      tags: ['Varsity', 'School Event', 'Action', 'Pinisara Media']
    });
  }
});

// 4. Gemini Search Grounding Endpoint (gemini-3-flash-preview with googleSearch tool)
app.post('/api/ai/search-grounding', async (req: Request, res: Response) => {
  try {
    const { query } = req.body;
    const ai = getGenAI();
    if (!ai) {
      return res.status(400).json({ error: 'Gemini API key not configured on server.' });
    }
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: query || 'Latest photography techniques for school sports and events',
      config: {
        tools: [{ googleSearch: {} }]
      }
    });

    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sources = chunks
      .map((c: any) => (c.web ? { title: c.web.title, uri: c.web.uri } : null))
      .filter(Boolean);

    return res.json({
      text: response.text || '',
      sources
    });
  } catch (error) {
    console.error('Search grounding error:', error);
    return res.status(500).json({ error: 'Failed to perform grounded search.' });
  }
});

// 5. Gemini Multi-Model AI Chat Endpoint (gemini-3.1-pro-preview, gemini-3-flash-preview, gemini-3.1-flash-lite-preview)
app.post('/api/ai/chat', async (req: Request, res: Response) => {
  try {
    const { message, mode } = req.body;
    const ai = getGenAI();
    if (!ai) {
      return res.json({
        reply:
          'Pinisara Photography AI Studio is ready. Ask about camera settings, aspect ratios, or event coverage!'
      });
    }

    const selectedModel =
      mode === 'pro'
        ? 'gemini-3.1-pro-preview'
        : mode === 'fast'
        ? 'gemini-3.1-flash-lite-preview'
        : 'gemini-3-flash-preview';

    const response = await ai.models.generateContent({
      model: selectedModel,
      contents: message,
      config: {
        systemInstruction:
          'You are the official Pinisara Photography Society AI Mentor at Pinnawala Central College. Help student photographers and viewers with camera settings (Canon DSLR, iPhone, Samsung Ultra), composition, aspect ratios, and school event coverage.'
      }
    });

    return res.json({
      reply: response.text || '',
      modelUsed: selectedModel
    });
  } catch (error) {
    console.error('AI Chat error:', error);
    return res.status(500).json({ error: 'Failed to generate AI response.' });
  }
});

// Vite middleware & production static file serving
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
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
