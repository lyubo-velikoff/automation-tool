import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
  useEffect
} from "react";
import { useToast } from "@/hooks/use-toast";
import { useSupabase } from "@/contexts/auth/SupabaseContext";
import { PostgrestSingleResponse } from "@supabase/supabase-js";

interface UserSettings {
  user_id: string;
  openai_api_key: string | null;
  gmail_tokens: any;
  updated_at: string;
}

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
  const { supabase, user } = useSupabase();

  // Load saved API key on mount
  useEffect(() => {
    if (user) {
      supabase
        .from("user_settings")
        .select("openai_api_key")
        .eq("user_id", user.id)
        .single()
        .then(({ data, error }: PostgrestSingleResponse<Pick<UserSettings, "openai_api_key">>) => {
          if (!error && data?.openai_api_key) {
            setApiKey(data.openai_api_key);
            setIsConnected(true);
          }
        });
    }
  }, [user, supabase]);

  const verifyKey = useCallback(
    async (key: string) => {
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to connect OpenAI",
          variant: "destructive"
        });
        return false;
      }

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

        // Update user settings with the new API key
        const { error: updateError } = await supabase
          .from("user_settings")
          .upsert({
            user_id: user.id,
            openai_api_key: key,
            updated_at: new Date().toISOString()
          }, {
            onConflict: "user_id"
          });

        if (updateError) {
          throw new Error("Failed to save API key");
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
    [toast, user, supabase]
  );

  const disconnect = useCallback(async () => {
    if (user) {
      // Remove API key from user settings
      await supabase
        .from("user_settings")
        .update({
          openai_api_key: null,
          updated_at: new Date().toISOString()
        })
        .eq("user_id", user.id);
    }

    setApiKey(null);
    setIsConnected(false);
    toast({
      title: "OpenAI Disconnected",
      description: "Successfully disconnected from OpenAI"
    });
  }, [toast, user, supabase]);

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
