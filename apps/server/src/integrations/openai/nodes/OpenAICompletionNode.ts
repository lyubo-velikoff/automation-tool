import { OpenAIService } from '../service';

interface OpenAICompletionConfig {
  prompt: string;
  model?: string;
  maxTokens?: number;
}

export class OpenAICompletionNode {
  constructor(
    private userId: string,
    private config: OpenAICompletionConfig
  ) {}

  async execute(context: Record<string, any>) {
    try {
      // Replace template variables in prompt
      let prompt = this.config.prompt;
      for (const [key, value] of Object.entries(context)) {
        prompt = prompt.replace(new RegExp(`{{${key}}}`, 'g'), value);
      }

      const result = await OpenAIService.generateCompletion(
        this.userId,
        prompt,
        this.config.model,
        this.config.maxTokens
      );

      return {
        success: true,
        completion: result.completion,
        usage: result.usage
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
} 
