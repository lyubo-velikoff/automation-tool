/// <reference types="jest" />

import { OpenAIService } from '../src/integrations/openai/service';
import { OpenAICompletionNode } from '../src/integrations/openai/nodes/OpenAICompletionNode';

// Mock OpenAI client
jest.mock('openai', () => {
  const mockCreate = jest.fn().mockResolvedValue({
    choices: [{ message: { content: 'Test completion response' } }],
    usage: { total_tokens: 10 }
  });

  const MockOpenAI = jest.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: mockCreate
      }
    }
  }));

  return {
    __esModule: true,
    default: MockOpenAI
  };
});

describe('OpenAI Integration', () => {
  const mockUserId = 'test-user-123';

  describe('OpenAICompletionNode', () => {
    it('should generate completion with template variables', async () => {
      const config = {
        prompt: 'Test prompt with {{variable}}',
        model: 'gpt-3.5-turbo',
        maxTokens: 100
      };

      const context = {
        variable: 'test value'
      };

      const completionNode = new OpenAICompletionNode(mockUserId, config);
      const result = await completionNode.execute(context);

      expect(result.success).toBe(true);
      expect(result.completion).toBeDefined();
      expect(result.usage).toBeDefined();
    });

    it('should handle errors gracefully', async () => {
      const config = {
        prompt: 'Test prompt',
        model: 'invalid-model',
        maxTokens: 100
      };

      const completionNode = new OpenAICompletionNode(mockUserId, config);
      const result = await completionNode.execute({});

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('OpenAIService', () => {
    it('should generate completion', async () => {
      const result = await OpenAIService.generateCompletion(
        mockUserId,
        'Test prompt',
        'gpt-3.5-turbo',
        100
      );

      expect(result.completion).toBeDefined();
      expect(result.usage).toBeDefined();
    });

    it('should validate model name', async () => {
      await expect(
        OpenAIService.generateCompletion(
          mockUserId,
          'Test prompt',
          'invalid-model',
          100
        )
      ).rejects.toThrow();
    });
  });
}); 
