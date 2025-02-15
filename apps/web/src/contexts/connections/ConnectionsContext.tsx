import {
  createContext,
  useContext,
  ReactNode,
  useState,
  useCallback,
  useEffect
} from "react";
import { useSupabase } from "@/contexts/auth/SupabaseContext";
import { useToast } from "@/hooks/use-toast";
import { SERVICES, ServiceType, ServiceState } from "@/types/services";

interface UserSettings {
  user_id: string;
  gmail_tokens: {
    access_token: string;
    refresh_token: string;
    updated_at: string;
  } | null;
  openai_api_key: string | null;
  updated_at: string;
}

type ConnectionsState = {
  [K in ServiceType]: ServiceState;
};

interface ConnectionsContextValue {
  connections: ConnectionsState;
  connect: (service: ServiceType, credentials?: Record<string, any>) => Promise<void>;
  disconnect: (service: ServiceType) => Promise<void>;
  checkConnection: (service: ServiceType) => Promise<void>;
  getServiceConfig: (service: ServiceType) => typeof SERVICES[ServiceType];
}

const ConnectionsContext = createContext<ConnectionsContextValue | undefined>(undefined);

const initialState: ConnectionsState = Object.keys(SERVICES).reduce((acc, service) => ({
  ...acc,
  [service]: { isConnected: false }
}), {} as ConnectionsState);

export function ConnectionsProvider({ children }: { children: ReactNode }) {
  const { supabase, user } = useSupabase();
  const { toast } = useToast();
  const [connections, setConnections] = useState<ConnectionsState>(initialState);

  // Load initial connection states
  useEffect(() => {
    if (user) {
      checkAllConnections();
    }
  }, [user]);

  const checkAllConnections = async () => {
    if (!user) return;

    const { data: settings } = await supabase
      .from("user_settings")
      .select("gmail_tokens, openai_api_key, updated_at")
      .eq("user_id", user.id)
      .single() as { data: UserSettings | null };

    if (settings) {
      setConnections({
        gmail: {
          isConnected: Boolean(settings.gmail_tokens?.access_token),
          lastUpdated: settings.gmail_tokens?.updated_at ? new Date(settings.gmail_tokens.updated_at) : undefined
        },
        openai: {
          isConnected: Boolean(settings.openai_api_key),
          lastUpdated: settings.updated_at ? new Date(settings.updated_at) : undefined
        }
      });
    }
  };

  const connect = useCallback(async (service: ServiceType, credentials?: Record<string, any>) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to connect services",
        variant: "destructive"
      });
      return;
    }

    const serviceConfig = SERVICES[service];

    try {
      switch (serviceConfig.type) {
        case "oauth": {
          // Handle OAuth flow
          const width = 600;
          const height = 600;
          const left = window.screenX + (window.outerWidth - width) / 2;
          const top = window.screenY + (window.outerHeight - height) / 2;
          const popup = window.open(
            `/auth/${service}-popup`,
            `${service}-auth`,
            `width=${width},height=${height},left=${left},top=${top}`
          );

          if (popup) {
            const messageHandler = async (event: MessageEvent) => {
              if (
                event.origin === window.location.origin &&
                event.data.type === `${service.toUpperCase()}_CONNECTED`
              ) {
                window.removeEventListener("message", messageHandler);
                await checkConnection(service);
                toast({
                  title: `${serviceConfig.name} Connected`,
                  description: `Successfully connected to ${serviceConfig.name}`
                });
              }
            };
            window.addEventListener("message", messageHandler);
          }
          break;
        }
        case "apiKey": {
          if (!credentials) {
            throw new Error("Credentials required for API key services");
          }

          // Save API key to user settings
          const { error: updateError } = await supabase
            .from("user_settings")
            .upsert({
              user_id: user.id,
              [`${service}_api_key`]: credentials.apiKey,
              updated_at: new Date().toISOString()
            }, {
              onConflict: "user_id"
            });

          if (updateError) {
            throw updateError;
          }

          await checkConnection(service);
          toast({
            title: `${serviceConfig.name} Connected`,
            description: `Successfully connected to ${serviceConfig.name}`
          });
          break;
        }
      }
    } catch (error) {
      setConnections(prev => ({
        ...prev,
        [service]: {
          isConnected: false,
          error: error instanceof Error ? error.message : "Connection failed"
        }
      }));
      toast({
        title: "Connection Failed",
        description: `Failed to connect to ${serviceConfig.name}`,
        variant: "destructive"
      });
    }
  }, [user, supabase, toast]);

  const disconnect = useCallback(async (service: ServiceType) => {
    if (!user) return;

    const serviceConfig = SERVICES[service];

    try {
      const updates = {
        [`${service}_tokens`]: null,
        [`${service}_api_key`]: null,
        updated_at: new Date().toISOString()
      };

      await supabase
        .from("user_settings")
        .update(updates)
        .eq("user_id", user.id);

      setConnections(prev => ({
        ...prev,
        [service]: { isConnected: false }
      }));

      toast({
        title: `${serviceConfig.name} Disconnected`,
        description: `Successfully disconnected from ${serviceConfig.name}`
      });
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to disconnect from ${serviceConfig.name}`,
        variant: "destructive"
      });
    }
  }, [user, supabase, toast]);

  const checkConnection = useCallback(async (service: ServiceType) => {
    if (!user) return;

    const { data: settings } = await supabase
      .from("user_settings")
      .select("gmail_tokens, openai_api_key, updated_at")
      .eq("user_id", user.id)
      .single() as { data: UserSettings | null };

    if (settings) {
      switch (service) {
        case "gmail":
          setConnections(prev => ({
            ...prev,
            gmail: {
              isConnected: Boolean(settings.gmail_tokens?.access_token),
              lastUpdated: settings.gmail_tokens?.updated_at ? new Date(settings.gmail_tokens.updated_at) : undefined
            }
          }));
          break;
        case "openai":
          setConnections(prev => ({
            ...prev,
            openai: {
              isConnected: Boolean(settings.openai_api_key),
              lastUpdated: settings.updated_at ? new Date(settings.updated_at) : undefined
            }
          }));
          break;
      }
    }
  }, [user, supabase]);

  const getServiceConfig = useCallback((service: ServiceType) => {
    return SERVICES[service];
  }, []);

  return (
    <ConnectionsContext.Provider
      value={{
        connections,
        connect,
        disconnect,
        checkConnection,
        getServiceConfig
      }}
    >
      {children}
    </ConnectionsContext.Provider>
  );
}

export function useConnections() {
  const context = useContext(ConnectionsContext);
  if (context === undefined) {
    throw new Error("useConnections must be used within a ConnectionsProvider");
  }
  return context;
} 