/**
 * Vercel Serverless Function
 * Endpoint: /api/analyze-emotion
 * 
 * Receives base64 image, calls OpenAI API, returns emotion metrics
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import OpenAI from 'openai';

// CORS headers
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', CORS_HEADERS['Access-Control-Allow-Origin']);
  res.setHeader('Access-Control-Allow-Methods', CORS_HEADERS['Access-Control-Allow-Methods']);
  res.setHeader('Access-Control-Allow-Headers', CORS_HEADERS['Access-Control-Allow-Headers']);

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).json({ ok: true });
  }

  // Only accept POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { imageBase64 } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: 'Missing imageBase64 in request body' });
    }

    // Initialize OpenAI client (API key from environment)
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // Call OpenAI API
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are an expert emotion analyzer. Analyze the facial expression in the image and provide:
- valence: emotional positivity from -1 (very negative/sad) to 1 (very positive/happy)
- arousal: emotional intensity from 0 (very calm/relaxed) to 1 (very excited/energetic)
- confidence: your confidence in this assessment from 0 (uncertain) to 1 (very certain)
- reasoning: brief explanation of your analysis

Consider facial features like:
- Mouth curvature (smile/frown)
- Eye openness and shape
- Eyebrow position
- Overall facial tension`,
        },
        {
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: {
                url: imageBase64,
                detail: 'low',
              },
            },
            {
              type: 'text',
              text: 'Analyze the emotion in this face image.',
            },
          ],
        },
      ],
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'emotion_analysis',
          strict: true,
          schema: {
            type: 'object',
            properties: {
              valence: {
                type: 'number',
                description: 'Emotional valence from -1 to 1',
              },
              arousal: {
                type: 'number',
                description: 'Emotional arousal from 0 to 1',
              },
              confidence: {
                type: 'number',
                description: 'Confidence level from 0 to 1',
              },
              reasoning: {
                type: 'string',
                description: 'Brief explanation of the analysis',
              },
            },
            required: ['valence', 'arousal', 'confidence', 'reasoning'],
            additionalProperties: false,
          },
        },
      },
      max_tokens: 200,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      return res.status(500).json({ error: 'No response from OpenAI' });
    }

    const result = JSON.parse(content);

    // Return emotion metrics with CORS headers
    return res.status(200).json({
      valence: result.valence,
      arousal: result.arousal,
      confidence: result.confidence,
      reasoning: result.reasoning,
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error('OpenAI API error:', error);
    
    return res.status(500).json({
      error: 'Failed to analyze emotion',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

// Configure function
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '2mb',
    },
  },
};

