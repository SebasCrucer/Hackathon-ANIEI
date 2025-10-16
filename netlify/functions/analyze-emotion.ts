/**
 * Netlify Serverless Function
 * Endpoint: /.netlify/functions/analyze-emotion
 * 
 * Receives base64 image, calls OpenAI API, returns emotion metrics
 */
import { Handler } from '@netlify/functions';
import OpenAI from 'openai';

export const handler: Handler = async (event) => {
  // Handle preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
      body: JSON.stringify({ ok: true }),
    };
  }

  // Only accept POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const { imageBase64 } = JSON.parse(event.body || '{}');

    if (!imageBase64) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing imageBase64 in request body' }),
      };
    }

    // Initialize OpenAI client
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
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'No response from OpenAI' }),
      };
    }

    const result = JSON.parse(content);

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        valence: result.valence,
        arousal: result.arousal,
        confidence: result.confidence,
        reasoning: result.reasoning,
        timestamp: Date.now(),
      }),
    };
  } catch (error) {
    console.error('OpenAI API error:', error);

    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        error: 'Failed to analyze emotion',
        details: error instanceof Error ? error.message : 'Unknown error',
      }),
    };
  }
};

