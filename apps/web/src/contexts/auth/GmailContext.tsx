"use client";

import { createContext, useContext, ReactNode } from "react";
import { useGmailAuth } from "@/hooks/auth/useGmailAuth";

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
  const { isGmailConnected, connectGmail, checkGmailConnection } = useGmailAuth();

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
