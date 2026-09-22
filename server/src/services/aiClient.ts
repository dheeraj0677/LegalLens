import OpenAI from 'openai';
import { config } from '../config';

class AIClientService {
  private client: OpenAI | null = null;
  private primaryModel: string;
  private fallbackModels: string[];

  constructor() {
    this.primaryModel = config.openRouterModel || 'qwen/qwen3.8-27b:free';
    this.fallbackModels = [
      this.primaryModel,
      'liquid/lfm-2.5-2.6b:free',
    ];
    this.initClient();
  }

  private initClient() {
    const key = config.openRouterApiKey;
    if (key && key.trim() !== '' && key !== 'your_openrouter_api_key_here') {
      this.client = new OpenAI({
        baseURL: 'https://openrouter.ai/api/v1',
        apiKey: key,
        timeout: 5000, // 5s timeout prevents hanging on upstream rate-limited providers
        defaultHeaders: {
          'HTTP-Referer': config.clientUrl || 'http://localhost:5173',
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
    return this.primaryModel;
  }

  /**
   * Generates a structured JSON response from OpenRouter, with fallback support.
   */
  public async generateStructuredJSON<T>(
    systemPrompt: string,
    userPrompt: string,
    fallbackGenerator: () => T
  ): Promise<T> {
    // In test environment, use deterministic domain engine to ensure fast, isolated tests
    if (process.env.NODE_ENV === 'test') {
      return fallbackGenerator();
    }

    if (!this.client && this.hasActiveKey()) {
      this.initClient();
    }

    if (!this.client) {
      return fallbackGenerator();
    }

    // Try primary user model, then 1 fast companion free model if rate-limited
    const modelsToTry = [this.primaryModel];
    if (!modelsToTry.includes('liquid/lfm-2.5-2.6b:free')) {
      modelsToTry.push('liquid/lfm-2.5-2.6b:free');
    }

    for (const model of modelsToTry) {
      try {
        const response = await this.client.chat.completions.create({
          model,
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
          temperature: 0.1,
          response_format: { type: 'json_object' },
        });

        const content = response.choices[0]?.message?.content;
        if (!content) {
          throw new Error(`Empty response received from model ${model}.`);
        }

        const cleaned = content
          .trim()
          .replace(/^```json\s*/i, '')
          .replace(/^```\s*/i, '')
          .replace(/```$/i, '')
          .trim();

        return JSON.parse(cleaned) as T;
      } catch (err: unknown) {
        const errorInfo = err && typeof err === 'object' && 'message' in err ? String(err.message) : String(err);
        console.warn(`[AIClient] Call to model '${model}' yielded error (${errorInfo}). Failing over...`);
      }
    }

    console.warn('[AIClient] Upstream OpenRouter models unavailable or rate-limited; engaging domain intelligence engine.');
    return fallbackGenerator();
  }
}

export const aiClient = new AIClientService();
