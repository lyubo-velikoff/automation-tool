"use client";

import { ApolloProvider } from "@apollo/client";
import { client } from "@/lib/apollo-client";
import { ThemeProvider } from "next-themes";
import { PropsWithChildren } from "react";
import { GmailProvider } from "@/contexts/auth/GmailContext";
import { OpenAIProvider } from "@/contexts/auth/OpenAIContext";

export function Providers({ children }: PropsWithChildren) {
  return (
    <ThemeProvider
      attribute='class'
      defaultTheme='system'
      enableSystem
      disableTransitionOnChange
    >
      <OpenAIProvider>
        <ApolloProvider client={client}>
          <GmailProvider>{children}</GmailProvider>
        </ApolloProvider>
      </OpenAIProvider>
    </ThemeProvider>
  );
}
