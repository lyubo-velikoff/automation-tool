import { Request, Response } from 'express';
import { SupabaseClient } from '@supabase/supabase-js';

export interface Context {
  user?: {
    id: string;
    email: string;
    user_metadata?: {
      gmail_tokens?: {
        access_token: string;
        refresh_token: string;
        expiry_date: number;
      };
    };
  };
  supabase?: SupabaseClient;
  req?: Request;
  res?: Response;
} 
