import { NodeVariable, ResultType, SelectorResult, NodeResults } from "../types/workflow";

interface VariablePreview {
  reference: string;
  preview: string;
  type: string;
}

export class VariableService {
  parseVariableReference(reference: string): NodeVariable | null {
    // Match pattern like {{Cursor.Title}} or {{Cursor.Title[0]}}
    const match = reference.match(/{{(\w+)\.(\w+)(?:\[(\d+)\])?}}/);
    if (!match) return null;

    const [_, nodeName, selectorName, index] = match;
    const type = selectorName === "*" ? "wholeNode" : "selector";
    
    return {
      nodeName,
      type,
      selectorName: type === "wholeNode" ? undefined : selectorName,
      index: index ? parseInt(index) : undefined
    };
  }

  private inferResultType(selectorName: string): ResultType {
    const lowerName = selectorName.toLowerCase();
    if (lowerName.includes("url")) return "url";
    if (lowerName.includes("price") || lowerName.includes("number")) return "number";
    if (lowerName.includes("html")) return "html";
    return "text";
  }

  resolveVariable(variable: NodeVariable, results: NodeResults): string | null {
    if (variable.type === "wholeNode") {
      return JSON.stringify(results);
    }

    if (!variable.selectorName || !results[variable.selectorName]) {
      return null;
    }

    const selectorResult = results[variable.selectorName];
    if (variable.index !== undefined) {
      return selectorResult.values[variable.index] || null;
    }

    return selectorResult.values[0] || null;
  }

  getAvailableVariables(results: NodeResults): VariablePreview[] {
    const variables: VariablePreview[] = [];

    // Add whole node reference
    variables.push({
      reference: "{{Cursor.*}}",
      preview: "Entire node results",
      type: "object"
    });

    // Add individual selector references
    for (const [selectorName, result] of Object.entries(results)) {
      if (!result.values.length) continue;

      // Basic reference
      variables.push({
        reference: `{{Cursor.${selectorName}}}`,
        preview: result.values[0],
        type: this.inferResultType(selectorName)
      });

      // If multiple values, add indexed references
      if (result.values.length > 1) {
        for (let i = 0; i < result.values.length; i++) {
          variables.push({
            reference: `{{Cursor.${selectorName}[${i}]}}`,
            preview: result.values[i],
            type: this.inferResultType(selectorName)
          });
        }
      }
    }

    return variables;
  }
} 
