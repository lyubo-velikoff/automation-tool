import { Field, ObjectType } from 'type-graphql';
import { OpenAIService } from '../service';
import { z } from 'zod';

@ObjectType()
export class CompletionNodeData {
  @Field()
  prompt!: string;

  @Field({ nullable: true })
  model?: string;

  @Field({ nullable: true })
  maxTokens?: number;

  @Field({ nullable: true })
  temperature?: number;
}

export const completionNodeSchema = z.object({
  prompt: z.string().min(1),
  model: z.enum(['gpt-3.5-turbo', 'gpt-4']).optional(),
  maxTokens: z.number().min(1).max(4096).optional(),
  temperature: z.number().min(0).max(2).optional(),
});

export class CompletionNode {
  private service: OpenAIService;

  constructor() {
    this.service = new OpenAIService();
  }

  async execute(data: CompletionNodeData): Promise<{ completion: string }> {
    const validatedData = completionNodeSchema.parse(data);
    
    const config = {
      ...(validatedData.model && { model: validatedData.model }),
      ...(validatedData.maxTokens && { maxTokens: validatedData.maxTokens }),
      ...(validatedData.temperature && { temperature: validatedData.temperature }),
    };

    const completion = await this.service.generateCompletion(
      validatedData.prompt
    );

    return { completion };
  }
} 
