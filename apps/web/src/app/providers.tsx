"use client";

import { ApolloProvider } from "@apollo/client";
import { client } from "@/lib/apollo-client";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/feedback/toaster";
import { SupabaseProvider } from "@/contexts/auth/SupabaseContext";
import { OpenAIProvider } from "@/contexts/auth/OpenAIContext";
import { GmailProvider } from "@/contexts/auth/GmailContext";

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <SupabaseProvider>
        <ApolloProvider client={client}>
          <OpenAIProvider>
            <GmailProvider>
              {children}
              <Toaster />
            </GmailProvider>
          </OpenAIProvider>
        </ApolloProvider>
      </SupabaseProvider>
    </ThemeProvider>
  );
}
