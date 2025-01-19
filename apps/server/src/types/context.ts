export interface Context {
  user?: {
    id: string;
    email: string;
  };
  token?: string;
} 
