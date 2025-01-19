import { z } from 'zod';

// Configuration schema for OpenAI
export const openAIConfigSchema = z.object({
  apiKey: z.string().min(1),
  model: z.enum(['gpt-3.5-turbo', 'gpt-4']).default('gpt-3.5-turbo'),
  maxTokens: z.number().min(1).max(4096).default(1024),
  temperature: z.number().min(0).max(2).default(0.7),
});

export type OpenAIConfig = z.infer<typeof openAIConfigSchema>;

// Default configuration
export const defaultConfig: OpenAIConfig = {
  apiKey: process.env.OPENAI_API_KEY || '',
  model: 'gpt-3.5-turbo',
  maxTokens: 1024,
  temperature: 0.7,
};

// Validate configuration
export function validateConfig(config: Partial<OpenAIConfig> = {}): OpenAIConfig {
  const mergedConfig = { ...defaultConfig, ...config };
  return openAIConfigSchema.parse(mergedConfig);
} 
