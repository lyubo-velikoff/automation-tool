// Base types for scraping functionality
export interface Position {
  x: number;
  y: number;
}

export interface SelectorConfig {
  selector: string;
  selectorType: 'css' | 'xpath';
  attributes: string[];
  name: string;
  description?: string;
}

export interface BatchConfig {
  batchSize: number;
  rateLimit: number;
}

export interface PaginationConfig {
  enabled: boolean;
  selector: string;
  maxPages?: number;
}

export interface ScrapingNodeData {
  label?: string;
  url?: string;
  urls?: string[];
  selectors?: SelectorConfig[];
  batchConfig?: BatchConfig;
  template?: string;
}

export interface ScrapedItem {
  [key: string]: string;
}

export interface ScrapingResult {
  success: boolean;
  results: string[];
  error?: string;
  data?: { [key: string]: string };
}

export interface SelectorResult {
  success: boolean;
  data?: any;
  error?: string;
}

// Additional types for specific integrations
export interface GmailTriggerResult {
  emails: Array<{
    id?: string;
    threadId?: string;
    labelIds?: string[];
    snippet?: string | null;
  }>;
}

export interface GmailActionResult {
  sent: boolean;
}

export interface OpenAICompletionConfig {
  model: string;
  temperature?: number;
  maxTokens?: number;
} 
