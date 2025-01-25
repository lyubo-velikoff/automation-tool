import { Request, Response } from 'express';

export interface Context {
  user?: {
    id: string;
    email: string;
  };
  req?: Request;
  res?: Response;
  token?: string;
} 
