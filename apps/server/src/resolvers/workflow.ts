import { Resolver, Query, Arg, Mutation } from "type-graphql";
import { VariableService } from "../services/VariableService";
import { NodeVariables } from "../schema/workflow";

interface VariableResult {
  reference: string;
  preview: string;
  type: string;
}

@Resolver()
export class WorkflowResolver {
  private variableService: VariableService;

  constructor() {
    this.variableService = new VariableService();
  }

  @Query(() => NodeVariables)
  async getNodeVariables(
    @Arg("nodeId") nodeId: string,
    @Arg("nodeName") nodeName: string,
    @Arg("results") results: string
  ): Promise<NodeVariables> {
    const nodeResults = JSON.parse(results);
    const variables = this.variableService.getAvailableVariables(nodeName, nodeResults);
    
    return {
      nodeId,
      nodeName,
      variables: variables.map(v => ({
        reference: v.reference,
        preview: v.preview,
        type: v.type
      }))
    };
  }

  // ... existing resolvers ...
} 
