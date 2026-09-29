import { translateText } from '../src/lib/translator.ts';

// Handler for Vercel Serverless Functions
export default async function handler(req: any, res: any) {
  // Set CORS headers if needed
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Only POST is accepted.' });
  }

  try {
    const { text, sourceLanguage, targetLanguage } = req.body || {};

    if (!text || typeof text !== 'string' || !text.trim()) {
      return res.status(400).json({ error: 'Please enter some text.' });
    }

    if (!sourceLanguage || !targetLanguage) {
      return res.status(400).json({ error: 'Both source and target languages are required.' });
    }

    const translation = await translateText(text, sourceLanguage, targetLanguage);
    return res.status(200).json({ translation });
  } catch (err: any) {
    console.error('Vercel translation API error:', err);
    return res.status(500).json({
      error: 'Translation failed. Please try again.',
      details: err?.message || 'Server error',
    });
  }
}
