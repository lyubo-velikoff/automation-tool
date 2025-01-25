import { SupabaseClient } from "@supabase/supabase-js";
import { Request } from "express";

export interface User {
  id: string;
  email: string;
}

export interface Context {
  user: User;
  supabase: SupabaseClient;
  req?: Request;
} 
