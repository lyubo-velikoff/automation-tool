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
    console.log("Debug - Gmail Connection Status:", isGmailConnected);
    
    if (isGmailConnected) {
      // Get token from Supabase session
      supabase.auth.getSession().then(({ data: { session } }) => {
        console.log("Debug - Full Session:", {
          hasSession: !!session,
          hasProviderToken: !!session?.provider_token,
          hasAccessToken: !!session?.access_token,
          provider: session?.user?.app_metadata?.provider
        });
        
        const token = session?.provider_token;
        console.log("Debug - Gmail Token from session:", token ? "Present" : "Missing");
        
        if (token) {
          // Store in localStorage
          localStorage.setItem('gmailToken', token);
          console.log("Debug - Gmail Token stored in localStorage");
          
          // Verify it was stored
          const storedToken = localStorage.getItem('gmailToken');
          console.log("Debug - Verification: Token in localStorage:", storedToken ? "Present" : "Missing");
        } else {
          console.warn("Debug - No Gmail token in session despite being connected");
        }
      });
    } else {
      // Clear token when disconnected
      localStorage.removeItem('gmailToken');
      console.log("Debug - Gmail Token removed from localStorage");
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
