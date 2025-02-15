"use client";

import { createContext, useContext, ReactNode, useEffect } from "react";
import { useGmailAuth } from "@/hooks/auth/useGmailAuth";
import { supabase } from "@/lib/supabase";

interface GmailContextType {
  isGmailConnected: boolean;
  connectGmail: () => void;
  checkGmailConnection: () => Promise<void>;
}

const GmailContext = createContext<GmailContextType | undefined>(undefined);

interface GmailProviderProps {
  children: ReactNode;
}

export function GmailProvider({ children }: GmailProviderProps) {
  const { isGmailConnected, connectGmail, checkGmailConnection } =
    useGmailAuth();

  // Store token in headers whenever it changes
  useEffect(() => {
    if (isGmailConnected) {
      // Get token from Supabase session
      supabase.auth.getSession().then(({ data: { session } }) => {
        const token = session?.provider_token;
        if (token) {
          // Store in localStorage
          localStorage.setItem('gmailToken', token);
        }
      });
    } else {
      // Clear token when disconnected
      localStorage.removeItem('gmailToken');
    }
  }, [isGmailConnected]);

  return (
    <GmailContext.Provider
      value={{ isGmailConnected, connectGmail, checkGmailConnection }}
    >
      {children}
    </GmailContext.Provider>
  );
}

export function useGmail() {
  const context = useContext(GmailContext);
  if (context === undefined) {
    throw new Error("useGmail must be used within a GmailProvider");
  }
  return context;
}
