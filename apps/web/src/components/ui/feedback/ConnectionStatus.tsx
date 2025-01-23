import { useEffect, useState } from "react";
import { Button } from "@/components/ui/inputs/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { useMutation } from "@apollo/client";
import { VALIDATE_OPENAI_CONNECTION } from "@/graphql/mutations";
import { supabase } from "@/lib/supabase";
interface ServiceStatus {
  gmail: boolean;
  openai: boolean;
}

interface ConnectionStatusProps {
  onOpenAISettings: () => void;
}

export default function ConnectionStatus({
  onOpenAISettings
}: ConnectionStatusProps) {
  const [status, setStatus] = useState<ServiceStatus>({
    gmail: false,
    openai: false
  });

  const [validateOpenAI] = useMutation(VALIDATE_OPENAI_CONNECTION);

  useEffect(() => {
    checkConnections();
  }, []);

  const checkConnections = async () => {
    // Check Gmail connection
    const {
      data: { session }
    } = await supabase.auth.getSession();
    const gmailConnected = session?.provider_token != null;

    // Get stored OpenAI API key
    const { data: settings } = await supabase
      .from("user_settings")
      .select("openai_api_key")
      .eq("user_id", session?.user?.id)
      .single();

    // Check OpenAI connection
    let openaiConnected = false;
    if (settings?.openai_api_key) {
      try {
        const { data } = await validateOpenAI({
          variables: { apiKey: settings.openai_api_key }
        });
        openaiConnected = data?.validateOpenAIConnection || false;
      } catch (error) {
        console.error("OpenAI validation error:", error);
      }
    }

    setStatus({
      gmail: gmailConnected,
      openai: openaiConnected
    });
  };

  const handleGmailConnect = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        scopes: "https://www.googleapis.com/auth/gmail.modify",
        redirectTo: `${window.location.origin}/workflows`
      }
    });
  };

  const handleOpenAIConnect = () => {
    onOpenAISettings();
  };

  return (
    <Card className='w-[300px]'>
      <CardHeader>
        <CardTitle>Service Connections</CardTitle>
        <CardDescription>Configure your service integrations</CardDescription>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <svg
              className='h-4 w-4'
              xmlns='http://www.w3.org/2000/svg'
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              strokeWidth='2'
              strokeLinecap='round'
              strokeLinejoin='round'
            >
              <path d='M22 4H2v16h20V4zM2 8l10 6 10-6' />
            </svg>
            Gmail
          </div>
          <Button
            variant={status.gmail ? "outline" : "default"}
            onClick={handleGmailConnect}
          >
            {status.gmail ? "Connected" : "Connect"}
          </Button>
        </div>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <svg
              className='h-4 w-4'
              xmlns='http://www.w3.org/2000/svg'
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              strokeWidth='2'
              strokeLinecap='round'
              strokeLinejoin='round'
            >
              <path d='M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z' />
            </svg>
            OpenAI
          </div>
          <Button
            variant={status.openai ? "outline" : "default"}
            onClick={handleOpenAIConnect}
          >
            {status.openai ? "Connected" : "Connect"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
