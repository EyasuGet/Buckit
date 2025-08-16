import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { GoogleGenerativeAI } from '@google/generative-ai';
import crypto from 'node:crypto';

const app = express();
app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

app.post('/lists', async (req, res) => {
  const { title, location, budget, party } = req.body || {};
  if (!title || !location) return res.status(400).json({ error: 'title and location are required' });
  if (!process.env.GOOGLE_API_KEY) return res.status(500).json({ error: 'missing_google_api_key' });

  const modelName = process.env.GEMINI_MODEL || 'gemini-1.5-flash';

  const prompt = `You generate engaging, safe local bucket lists that are applicable inside Addis Ababa, Ethiopia, using the location given.
Return ONLY a JSON object (no markdown, no code fences, no headings).
Schema:
{
  "title": string,
  "subtitle": string,
  "items": [
    {
      "title": string (<=60 chars),
      "description": string (1-2 sentences),
      "tags": string[2..4],
      "place": {
        "name": string,                // exact venue/landmark name
        "address": string,             // street address or helpful directions
        "neighborhood": string?,       // optional
        "map_url": string?             // optional Google Maps URL
      },
      "priceTier": "$"|"$$"|"$$$"    // align roughly with budget
    }
  ]
}

Create a bucket list titled "${title}" for ${party} in ${location}. Budget: ${budget}.
Return 6 varied items tailored to the location and audience and also precise cafe names and hotels or parks in Addis Ababa.
Favor well-known places or landmarks with precise names and addresses. If an exact street address is not applicable (e.g., parks, viewpoints), provide the best-known entrance or map pin link.`;

  try {
    const model = genAI.getGenerativeModel({
      model: modelName,
      generationConfig: { responseMimeType: 'application/json' },
    });

    const result = await model.generateContent(prompt);
    const text = result?.response?.text?.() || '{}';

    let ai;
    try {
      ai = JSON.parse(text);
    } catch (e) {
      const match = String(text).match(/\{[\s\S]*\}/);
      ai = match ? JSON.parse(match[0]) : {};
    }

    const id = crypto.randomUUID();
    const items = Array.isArray(ai.items)
      ? ai.items.slice(0, 20).map((it, i) => ({
          id: it.id || `${id}-${i + 1}`,
          title: String(it.title || `Item ${i + 1}`),
          description: String(it.description || ''),
          tags: Array.isArray(it.tags) ? it.tags.slice(0, 4).map(String) : [],
          priceTier: it.priceTier && typeof it.priceTier === 'string' ? it.priceTier : undefined,
          place: it.place && typeof it.place === 'object'
            ? {
                name: typeof it.place.name === 'string' ? it.place.name : '',
                address: typeof it.place.address === 'string' ? it.place.address : '',
                neighborhood: typeof it.place.neighborhood === 'string' ? it.place.neighborhood : undefined,
                mapUrl: typeof it.place.map_url === 'string' ? it.place.map_url : (typeof it.place.mapUrl === 'string' ? it.place.mapUrl : undefined),
              }
            : undefined,
          done: false,
        }))
      : [];

    res.json({
      id,
      title: ai.title || title,
      subtitle: ai.subtitle || `Top things to do in ${location}`,
      location,
      budget,
      party,
      items,
      createdAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'generation_failed' });
  }
});

app.listen(process.env.PORT || 8787, () => {
  console.log('Server on http://localhost:' + (process.env.PORT || 8787));
});