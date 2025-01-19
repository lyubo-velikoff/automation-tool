import { Resolver, Mutation, Arg } from 'type-graphql';
import { OpenAIService } from '../integrations/openai/service';
import { CompletionNodeData } from '../integrations/openai/nodes/CompletionNode';

@Resolver()
export class OpenAIResolver {
  private service: OpenAIService;

  constructor() {
    this.service = new OpenAIService();
  }

  @Mutation(() => String)
  async generateCompletion(
    @Arg('data') data: CompletionNodeData
  ): Promise<string> {
    return this.service.generateCompletion(data.prompt);
  }

  @Mutation(() => Boolean)
  async validateOpenAIConnection(): Promise<boolean> {
    return this.service.validateConnection();
  }
} 
