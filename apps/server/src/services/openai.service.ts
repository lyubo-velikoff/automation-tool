import OpenAI from 'openai';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { supabase } from '../lib/supabase';

export class OpenAIService {
  private openai: OpenAI;
  private ratelimit: Ratelimit;

  constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error('OpenAI API key is required');
    }
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

    if (error) {
      console.error('Error fetching OpenAI API key:', error);
      throw new Error('Failed to fetch OpenAI API key from settings');
    }
    
    if (!settings?.openai_api_key) {
      throw new Error('OpenAI API key not found in user settings. Please add your API key in the settings.');
    }

    return new OpenAIService(settings.openai_api_key);
  }

  async complete(prompt: string, options: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
  } = {}): Promise<string> {
    if (!prompt.trim()) {
      throw new Error('Prompt cannot be empty');
    }

    // Check rate limit
    const { success, reset } = await this.ratelimit.limit('openai_api');
    if (!success) {
      const resetInSeconds = Math.ceil((reset - Date.now()) / 1000);
      throw new Error(`Rate limit exceeded. Please try again in ${resetInSeconds} seconds.`);
    }

    try {
      // Validate model
      const model = options.model || 'gpt-4o-mini';
      const validModels = ['gpt-4o-mini', 'dall-e-2', 'whisper-1', 'dall-e-3', 'gpt-4o'];
      if (!validModels.includes(model)) {
        throw new Error(`Invalid model. Must be one of: ${validModels.join(', ')}`);
      }

      // Validate other parameters
      const temperature = options.temperature ?? 0.7;
      if (temperature < 0 || temperature > 2) {
        throw new Error('Temperature must be between 0 and 2');
      }

      const maxTokens = options.maxTokens ?? 100;
      if (maxTokens < 1 || maxTokens > 4000) {
        throw new Error('Max tokens must be between 1 and 4000');
      }

      const completion = await this.openai.chat.completions.create({
        model,
        messages: [{ role: 'user', content: prompt }],
        temperature,
        max_tokens: maxTokens,
      });

      if (!completion.choices[0]?.message?.content) {
        throw new Error('No completion generated');
      }

      return completion.choices[0].message.content;
    } catch (error: any) {
      // Handle specific OpenAI error types
      if (error.error?.type === 'invalid_request_error') {
        if (error.error?.code === 'model_not_found') {
          throw new Error(`Model access error: The model '${options.model}' was not found or you don't have access to it.`);
        }
        if (error.error?.code === 'context_length_exceeded') {
          throw new Error('The prompt is too long for the model to process. Please reduce the length of your input.');
        }
        if (error.error?.code === 'rate_limit_exceeded') {
          throw new Error('OpenAI rate limit exceeded. Please try again later or upgrade your plan.');
        }
      }
      
      if (error.error?.type === 'invalid_api_key') {
        throw new Error('Invalid OpenAI API key. Please check your API key in the settings.');
      }
      
      if (error.error?.type === 'insufficient_quota') {
        throw new Error('OpenAI API quota exceeded. Please check your usage and billing status.');
      }
      
      // Log the full error for debugging
      console.error('OpenAI API Error:', {
        type: error.error?.type,
        code: error.error?.code,
        message: error.error?.message,
        status: error.status,
        stack: error.stack
      });
      
      // Throw a more specific error message
      throw new Error(`OpenAI error: ${error.error?.message || error.message || 'An unexpected error occurred'}`);
    }
  }
} 
