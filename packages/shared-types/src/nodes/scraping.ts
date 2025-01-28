export interface SelectorConfig {
  selector: string;
  selectorType: 'css' | 'xpath';
  attributes: string[];
  name: string;
  description?: string;
}

export interface ScrapedItem {
  [key: string]: string;
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

export interface ScrapingResult {
  success: boolean;
  data?: { [key: string]: string };
  error?: string;
  results?: ScrapedItem[];
}

export interface SelectorResult {
  success: boolean;
  data?: any;
  error?: string;
}

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
