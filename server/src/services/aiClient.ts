import OpenAI from 'openai';
import { config } from '../config';

class AIClientService {
  private client: OpenAI | null = null;

  constructor() {
    this.initClient();
  }

  private initClient() {
    const key = config.openRouterApiKey;
    if (key && key.trim() !== '' && key !== 'your_openrouter_api_key_here') {
      this.client = new OpenAI({
        baseURL: 'https://openrouter.ai/api/v1',
        apiKey: key,
        defaultHeaders: {
          'HTTP-Referer': 'http://localhost:5173',
          'X-Title': 'LegalLens Document Intelligence',
        },
      });
    } else {
      this.client = null;
    }
  }

  public hasActiveKey(): boolean {
    const key = config.openRouterApiKey;
    return Boolean(key && key.trim() !== '' && key !== 'your_openrouter_api_key_here');
  }

  public getModel(): string {
    return config.openRouterModel;
  }

  /**
   * Generates a structured JSON response from OpenRouter, with fallback support.
   */
  public async generateStructuredJSON<T>(
    systemPrompt: string,
    userPrompt: string,
    fallbackGenerator: () => T
  ): Promise<T> {
    // Re-check client in case key was added dynamically
    if (!this.client && this.hasActiveKey()) {
      this.initClient();
    }

    if (!this.client) {
      // Return high-fidelity domain fallback when key is not yet set
      return fallbackGenerator();
    }

    try {
      const response = await this.client.chat.completions.create({
        model: this.getModel(),
        messages: [
          {
            role: 'system',
            content: `${systemPrompt}\n\nIMPORTANT: You must return ONLY valid, parseable JSON matching the requested structure. Do not include markdown code blocks, backticks, or explanatory text.`,
          },
          {
            role: 'user',
            content: userPrompt,
          },
        ],
        temperature: 0.1, // Low temperature for high consistency and factual legal extraction
        response_format: { type: 'json_object' },
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('Empty response received from OpenRouter model.');
      }

      // Clean possible markdown code fences if model returned them
      const cleaned = content
        .trim()
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/i, '')
        .replace(/```$/i, '')
        .trim();

      return JSON.parse(cleaned) as T;
    } catch (err) {
      console.warn('[AIClient] OpenRouter call failed, engaging domain fallback engine:', err);
      return fallbackGenerator();
    }
  }
}

export const aiClient = new AIClientService();
