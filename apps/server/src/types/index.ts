import { SupabaseClient } from "@supabase/supabase-js";

export interface User {
  id: string;
  email: string;
}

export interface Context {
  user: User;
  supabase: SupabaseClient;
} 
