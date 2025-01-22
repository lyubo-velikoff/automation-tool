"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "@/components/ui/use-toast";

export function useGmailAuth() {
  const [isGmailConnected, setIsGmailConnected] = useState(false);
  const [authWindow, setAuthWindow] = useState<Window | null>(null);

  const checkGmailConnection = useCallback(async () => {
    try {
      const {
        data: { session }
      } = await supabase.auth.getSession();

      if (!session?.provider_token) {
        setIsGmailConnected(false);
        return;
      }

      // Verify the token by making a test API call
      const response = await fetch(
        "https://gmail.googleapis.com/gmail/v1/users/me/profile",
        {
          headers: {
            Authorization: `Bearer ${session.provider_token}`
          }
        }
      );

      // Handle different response statuses
      if (response.status === 401) {
        // Silent handling for unauthorized - just update state
        setIsGmailConnected(false);
        return;
      }

      if (!response.ok) {
        setIsGmailConnected(false);
        // Only show toast for unexpected errors if we were previously connected
        if (isGmailConnected) {
          toast({
            title: "Gmail Connection Issue",
            description: "There was a problem with your Gmail connection",
            variant: "default"
          });
        }
        return;
      }

      setIsGmailConnected(true);
      // Only show success toast when connecting, not on initial check
      if (!isGmailConnected) {
        toast({
          title: "Connected",
          description: "Gmail connection successful"
        });
      }
    } catch (error) {
      console.error("Error checking Gmail connection:", error);
      setIsGmailConnected(false);
      // Only show error toast if we were previously connected and it's not a network error
      if (isGmailConnected && !(error instanceof TypeError)) {
        toast({
          title: "Gmail Connection Lost",
          description: "Please reconnect your Gmail account",
          variant: "default"
        });
      }
    }
  }, [isGmailConnected]);

  const connectGmail = useCallback(() => {
    // Close any existing auth windows
    if (authWindow && !authWindow.closed) {
      authWindow.close();
    }

    // Calculate popup position
    const width = 600;
    const height = 600;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;

    // Open popup
    const popup = window.open(
      "/auth/gmail-popup",
      "gmail-auth",
      `width=${width},height=${height},left=${left},top=${top},popup=true`
    );

    if (popup) {
      setAuthWindow(popup);
    } else {
      toast({
        title: "Popup Blocked",
        description: "Please allow popups for this site to connect Gmail.",
        variant: "destructive"
      });
    }
  }, [authWindow]);

  useEffect(() => {
    checkGmailConnection();

    // Listen for messages from popup
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;

      if (event.data?.type === "GMAIL_CONNECTED") {
        checkGmailConnection();
      } else if (event.data?.type === "GMAIL_ERROR") {
        toast({
          title: "Connection Failed",
          description: "Failed to connect Gmail. Please try again.",
          variant: "destructive"
        });
      }
    };

    window.addEventListener("message", handleMessage);

    // Check if auth window is still open periodically
    const checkAuthWindow = setInterval(() => {
      if (authWindow && authWindow.closed) {
        setAuthWindow(null);
      }
    }, 1000);

    return () => {
      window.removeEventListener("message", handleMessage);
      clearInterval(checkAuthWindow);
      // Close auth window if component unmounts
      if (authWindow && !authWindow.closed) {
        authWindow.close();
      }
    };
  }, [authWindow, checkGmailConnection]);

  return {
    isGmailConnected,
    connectGmail,
    checkGmailConnection
  };
} 
