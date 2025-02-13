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

  private inferResultType(selectorName: string): string {
    const lowerName = selectorName.toLowerCase();
    if (lowerName.includes("url") || lowerName.includes("href")) return "url";
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

  getAvailableVariables(nodeName: string, results: NodeResults): VariablePreview[] {
    const variables: VariablePreview[] = [];

    // Add whole node reference
    variables.push({
      reference: `{{${nodeName}.*}}`,
      preview: "Entire node results",
      type: "object"
    });

    // Add selector references
    if (results.bySelector) {
      Object.entries(results.bySelector).forEach(([selectorName, selectorResults]) => {
        if (!selectorResults?.length) return;

        // Add basic reference
        variables.push({
          reference: `{{${nodeName}.${selectorName}}}`,
          preview: selectorResults[0]?.[0] || "No results",
          type: this.inferResultType(selectorName)
        });

        // Add indexed references if multiple results
        selectorResults.forEach((result, index) => {
          if (result?.[0]) {
            variables.push({
              reference: `{{${nodeName}.${selectorName}[${index}]}}`,
              preview: result[0],
              type: this.inferResultType(selectorName)
            });
          }
        });
      });
    }

    return variables;
  }
} 
