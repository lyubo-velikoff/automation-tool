export interface SelectorConfig {
  selector: string;
  selectorType: 'css' | 'xpath';
  attributes: string[];
  name: string;
}

export interface ScrapedItem {
  [key: string]: string;
}

export interface BatchConfig {
  batchSize: number;
  rateLimit: number;
}

export interface ScrapingResult {
  success: boolean;
  data?: { [key: string]: string };
  error?: string;
  results?: ScrapedItem[];
} 
