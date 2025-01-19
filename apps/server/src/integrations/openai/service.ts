import OpenAI from 'openai';
import { OpenAIConfig, validateConfig } from './config';

export class OpenAIService {
  private client: OpenAI;
  private config: OpenAIConfig;

  constructor(config: Partial<OpenAIConfig> = {}) {
    this.config = validateConfig(config);
    this.client = new OpenAI({
      apiKey: this.config.apiKey,
    });
  }

  async generateCompletion(prompt: string): Promise<string> {
    try {
      const response = await this.client.chat.completions.create({
        model: this.config.model,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: this.config.maxTokens,
        temperature: this.config.temperature,
      });

      return response.choices[0]?.message?.content || '';
    } catch (error) {
      console.error('OpenAI API Error:', error);
      throw new Error('Failed to generate completion from OpenAI');
    }
  }

  // Method to validate API key and connection
  async validateConnection(): Promise<boolean> {
    try {
      await this.generateCompletion('test');
      return true;
    } catch {
      return false;
    }
  }

  static async generateCompletion(
    userId: string,
    prompt: string,
    model: string = 'gpt-3.5-turbo',
    maxTokens: number = 100
  ) {
    // Validate model name
    const validModels = ['gpt-3.5-turbo', 'gpt-4'];
    if (!validModels.includes(model)) {
      throw new Error(`Invalid model name. Must be one of: ${validModels.join(', ')}`);
    }

    // @ts-ignore - OpenAI mock doesn't match the type exactly
    const openai = new (OpenAI as any)({
      apiKey: process.env.OPENAI_API_KEY
    });

    const completion = await openai.chat.completions.create({
      model,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: maxTokens
    });

    return {
      completion: completion.choices[0]?.message?.content,
      usage: completion.usage
    };
  }
} 
