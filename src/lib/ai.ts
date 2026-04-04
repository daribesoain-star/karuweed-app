import { AIAnalysis } from './types';

const ANTHROPIC_API_KEY = process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY || '';

export async function analyzePlantImage(base64Image: string): Promise<AIAnalysis> {
  if (!ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY is not configured');
  }

  const prompt = `You are an expert cannabis cultivation advisor. Analyze this plant image and provide:
1. A detailed diagnosis of the plant's current state
2. A health score from 0-100
3. 3-5 specific recommendations for improvement
4. Any identified issues or problems

Respond in valid JSON format with these exact keys:
{
  "diagnosis": "string describing the plant's current state",
  "health_score": number from 0-100,
  "recommendations": ["recommendation 1", "recommendation 2", ...],
  "identified_issues": ["issue 1", "issue 2", ...] or []
}

Be specific about nutrient deficiencies, pest issues, lighting problems, growth stage indicators, and environmental concerns for cannabis cultivation.`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: 'image/jpeg',
                  data: base64Image,
                },
              },
              {
                type: 'text',
                text: prompt,
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Claude API error:', error);
      throw new Error(`Claude API error: ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.content[0]?.text || '';

    // Extract JSON from the response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to parse JSON response from Claude');
    }

    const analysis: AIAnalysis = JSON.parse(jsonMatch[0]);

    // Validate the response structure
    if (
      typeof analysis.diagnosis !== 'string' ||
      typeof analysis.health_score !== 'number' ||
      !Array.isArray(analysis.recommendations) ||
      !Array.isArray(analysis.identified_issues)
    ) {
      throw new Error('Invalid response structure from Claude');
    }

    return analysis;
  } catch (error) {
    console.error('Error analyzing plant image:', error);
    throw error;
  }
}
