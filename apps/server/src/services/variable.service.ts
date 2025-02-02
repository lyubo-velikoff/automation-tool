import { NodeVariable, ResultType, SelectorResult, NodeResults } from '../types/workflow';

export class VariableService {
  /**
   * Parse a variable reference string into its components
   * @param reference e.g., "Cursor.Title[0]" or "Cursor.Title" or "Cursor"
   */
  parseVariableReference(reference: string): NodeVariable | null {
    // Handle whole node reference
    if (!reference.includes('.')) {
      return {
        type: 'wholeNode',
        format: 'text',
        reference
      };
    }

    // Parse node.selector[index] pattern
    const matches = reference.match(/^([^.]+)\.([^[]+)(?:\[(\d+)\])?$/);
    if (!matches) return null;

    const [_, nodeName, selectorName, index] = matches;
    
    return {
      type: 'selector',
      format: this.inferResultType(selectorName),
      reference: index ? `${nodeName}.${selectorName}[${index}]` : `${nodeName}.${selectorName}`
    };
  }

  /**
   * Infer the result type based on selector name or content
   */
  private inferResultType(selectorName: string): ResultType {
    const lowerName = selectorName.toLowerCase();
    
    if (lowerName.includes('url') || lowerName.includes('link') || lowerName.includes('href')) {
      return 'url';
    }
    
    if (lowerName.includes('html') || lowerName.includes('content')) {
      return 'html';
    }
    
    if (lowerName.includes('count') || lowerName.includes('number') || lowerName.includes('index')) {
      return 'number';
    }
    
    return 'text';
  }

  /**
   * Resolve a variable reference against node results
   */
  resolveVariable(reference: string, results: NodeResults): SelectorResult | SelectorResult[][] | string | null {
    const variable = this.parseVariableReference(reference);
    if (!variable) return null;

    if (variable.type === 'wholeNode') {
      return results.wholeNode || null;
    }

    const [nodeName, selectorName, indexStr] = reference.split(/[.\[]/).map(part => part.replace(']', ''));
    const selectorResults = results.bySelector[selectorName];
    
    if (!selectorResults) return null;

    if (indexStr !== undefined) {
      const index = parseInt(indexStr);
      return selectorResults[0]?.[index] || null;
    }

    return selectorResults;
  }

  /**
   * Get available variables from node results
   */
  getAvailableVariables(nodeName: string, results: NodeResults) {
    const variables: { reference: string; preview: string; type: ResultType }[] = [];

    // Add whole node reference
    if (results.wholeNode) {
      variables.push({
        reference: `{{${nodeName}}}`,
        preview: results.wholeNode.slice(0, 50) + (results.wholeNode.length > 50 ? '...' : ''),
        type: 'text'
      });
    }

    // Add selector references
    Object.entries(results.bySelector).forEach(([selectorName, selectorResults]) => {
      // Add full selector reference
      variables.push({
        reference: `{{${nodeName}.${selectorName}}}`,
        preview: `Array(${selectorResults.length} results)`,
        type: selectorResults[0]?.[0]?.type || 'text'
      });

      // Add first result reference if available
      if (selectorResults[0]?.[0]) {
        variables.push({
          reference: `{{${nodeName}.${selectorName}[0]}}`,
          preview: selectorResults[0][0].value.slice(0, 50) + (selectorResults[0][0].value.length > 50 ? '...' : ''),
          type: selectorResults[0][0].type
        });
      }
    });

    return variables;
  }
} 
