import OpenAI from 'openai';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { supabase } from '../lib/supabase';

export class OpenAIService {
  private openai: OpenAI;
  private ratelimit: Ratelimit;

  constructor(apiKey: string) {
    this.openai = new OpenAI({ apiKey });
    
    // Create a new ratelimit instance
    const redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL || '',
      token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
    });

    this.ratelimit = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(20, '1 m'), // 20 requests per minute
      analytics: true,
      prefix: 'openai_ratelimit',
    });
  }

  static async create(userId: string): Promise<OpenAIService> {
    // Get API key from user settings
    const { data: settings, error } = await supabase
      .from('user_settings')
      .select('openai_api_key')
      .eq('user_id', userId)
      .single();

    if (error) throw error;
    if (!settings?.openai_api_key) {
      throw new Error('OpenAI API key not found in user settings');
    }

    return new OpenAIService(settings.openai_api_key);
  }

  async complete(prompt: string, options: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
  } = {}): Promise<string> {
    // Check rate limit
    const { success } = await this.ratelimit.limit('openai_api');
    if (!success) {
      throw new Error('Rate limit exceeded. Please try again later.');
    }

    try {
      const completion = await this.openai.chat.completions.create({
        model: options.model || 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: options.temperature ?? 0.7,
        max_tokens: options.maxTokens ?? 100,
      });

      if (!completion.choices[0]?.message?.content) {
        throw new Error('No completion generated');
      }

      return completion.choices[0].message.content;
    } catch (error) {
      console.error('OpenAI API error:', error);
      if (error instanceof Error) {
        // Check for specific OpenAI error types
        if ('status' in error) {
          switch ((error as any).status) {
            case 401:
              throw new Error('Invalid OpenAI API key');
            case 429:
              throw new Error('OpenAI rate limit exceeded');
            case 500:
              throw new Error('OpenAI service error');
            default:
              throw new Error(`OpenAI error: ${error.message}`);
          }
        }
        throw new Error(`OpenAI error: ${error.message}`);
      }
      throw new Error('Unknown error occurred while generating completion');
    }
  }
} 
