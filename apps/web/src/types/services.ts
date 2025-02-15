export interface ServiceConfig {
  name: string;
  type: 'oauth' | 'apiKey';
  description: string;
  icon: string;
  scopes?: string[];
  requiredFields?: {
    [key: string]: {
      type: 'string' | 'password';
      label: string;
      placeholder?: string;
    };
  };
}

export interface ServiceConnection {
  id: string;
  service: keyof typeof SERVICES;
  userId: string;
  credentials: Record<string, any>;
  isConnected: boolean;
  lastUpdated: Date;
  error?: string;
}

export const SERVICES = {
  gmail: {
    name: 'Gmail',
    type: 'oauth',
    description: 'Connect your Gmail account to send and receive emails',
    icon: 'mail',
    scopes: [
      'https://www.googleapis.com/auth/gmail.send',
      'https://www.googleapis.com/auth/gmail.readonly'
    ]
  },
  openai: {
    name: 'OpenAI',
    type: 'apiKey',
    description: 'Connect your OpenAI account to use AI features',
    icon: 'sparkles',
    requiredFields: {
      apiKey: {
        type: 'password',
        label: 'API Key',
        placeholder: 'sk-...'
      }
    }
  }
} as const;

export type ServiceType = keyof typeof SERVICES;

export interface ServiceState {
  isConnected: boolean;
  lastUpdated?: Date;
  error?: string;
} 