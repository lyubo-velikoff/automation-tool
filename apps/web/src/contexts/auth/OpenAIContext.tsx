import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode
} from "react";
import { useToast } from "@/hooks/use-toast";

interface OpenAIContextType {
  isConnected: boolean;
  apiKey: string | null;
  verifyKey: (key: string) => Promise<boolean>;
  setApiKey: (key: string) => void;
  disconnect: () => void;
}

const OpenAIContext = createContext<OpenAIContextType | undefined>(undefined);

export function OpenAIProvider({ children }: { children: ReactNode }) {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { toast } = useToast();

  const verifyKey = useCallback(
    async (key: string) => {
      try {
        const response = await fetch("/api/openai/verify", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ apiKey: key })
        });

        if (!response.ok) {
          throw new Error("Invalid API key");
        }

        setApiKey(key);
        setIsConnected(true);
        toast({
          title: "OpenAI Connected",
          description: "Successfully connected to OpenAI"
        });
        return true;
      } catch (error) {
        toast({
          title: "Connection Failed",
          description:
            error instanceof Error
              ? error.message
              : "Failed to connect to OpenAI",
          variant: "destructive"
        });
        return false;
      }
    },
    [toast]
  );

  const disconnect = useCallback(() => {
    setApiKey(null);
    setIsConnected(false);
    toast({
      title: "OpenAI Disconnected",
      description: "Successfully disconnected from OpenAI"
    });
  }, [toast]);

  return (
    <OpenAIContext.Provider
      value={{
        isConnected,
        apiKey,
        verifyKey,
        setApiKey: (key: string) => {
          setApiKey(key);
          setIsConnected(true);
        },
        disconnect
      }}
    >
      {children}
    </OpenAIContext.Provider>
  );
}

export function useOpenAI() {
  const context = useContext(OpenAIContext);
  if (context === undefined) {
    throw new Error("useOpenAI must be used within an OpenAIProvider");
  }
  return context;
}
