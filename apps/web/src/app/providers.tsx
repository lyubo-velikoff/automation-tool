"use client";

import { ApolloProvider } from "@apollo/client";
import { client } from "@/lib/apollo-client";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/feedback/toaster";
import { SupabaseProvider } from "@/contexts/auth/SupabaseContext";
import { ConnectionsProvider } from "@/contexts/connections/ConnectionsContext";

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
          <ConnectionsProvider>
            {children}
            <Toaster />
          </ConnectionsProvider>
        </ApolloProvider>
      </SupabaseProvider>
    </ThemeProvider>
  );
}
