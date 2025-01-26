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
    } catch (error: any) {
      // Handle specific OpenAI error types
      if (error.error?.type === 'invalid_request_error') {
        if (error.error?.code === 'model_not_found') {
          throw new Error(`Model access error: ${error.error.message}`);
        }
      }
      
      // Log the full error for debugging
      console.error('OpenAI API Error:', error);
      
      // Throw a more specific error message
      throw new Error(`OpenAI error: ${error.status || 500} ${error.error?.message || error.message || 'Unknown error'}`);
    }
  }
} 
