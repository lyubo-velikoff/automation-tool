declare module 'xpath' {
  export function select(expression: string, node: Node, single?: boolean): Node[] | string;
  export function select1(expression: string, node: Node): Node | null;
  export function evaluate(expression: string, node: Node, resolver?: XPathNSResolver): XPathResult;
}

declare module 'xmldom' {
  export class DOMParser {
    constructor(options?: {
      errorHandler?: {
        warning?: (msg: string) => void;
        error?: (msg: string) => void;
        fatalError?: (msg: string) => void;
      };
    });
    parseFromString(source: string, mimeType?: string): Document;
  }
} 
