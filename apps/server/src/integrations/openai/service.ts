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
} 
