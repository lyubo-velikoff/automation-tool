"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "@/hooks/use-toast";

// Static cache for connection status
let connectionCheckPromise: Promise<boolean> | null = null;
let lastCheckTime = 0;
const CACHE_DURATION = 30000; // 30 seconds

export function useGmailAuth() {
  const [isGmailConnected, setIsGmailConnected] = useState(false);
  const [authWindow, setAuthWindow] = useState<Window | null>(null);
console.log('isGmailConnected', isGmailConnected)
  const checkGmailConnection = useCallback(async () => {
    const now = Date.now();

    // If there's an ongoing check, wait for it
    if (connectionCheckPromise) {
      const result = await connectionCheckPromise;
      setIsGmailConnected(result);
      return;
    }

    // If the last check was recent, use cached value
    if (now - lastCheckTime < CACHE_DURATION) {
      return;
    }

    // Create new connection check promise
    connectionCheckPromise = (async () => {
      try {
        const {
          data: { session }
        } = await supabase.auth.getSession();

        if (!session?.provider_token) {
          return false;
        }

        const response = await fetch(
          "https://gmail.googleapis.com/gmail/v1/users/me/profile",
          {
            headers: {
              Authorization: `Bearer ${session.provider_token}`
            }
          }
        );

        if (response.status === 401) {
          return false;
        }

        if (!response.ok) {
          if (isGmailConnected) {
            toast({
              title: "Gmail Connection Issue",
              description: "There was a problem with your Gmail connection",
              variant: "default"
            });
          }
          return false;
        }

        if (!isGmailConnected) {
          toast({
            title: "Connected",
            description: "Gmail connection successful"
          });
        }
        return true;
      } catch (error) {
        console.error("Error checking Gmail connection:", error);
        if (isGmailConnected && !(error instanceof TypeError)) {
          toast({
            title: "Gmail Connection Lost",
            description: "Please reconnect your Gmail account",
            variant: "default"
          });
        }
        return false;
      } finally {
        lastCheckTime = Date.now();
        connectionCheckPromise = null;
      }
    })();

    const result = await connectionCheckPromise;
    setIsGmailConnected(result);
  }, [isGmailConnected]);

  const connectGmail = useCallback(() => {
    // Reset cache when manually connecting
    connectionCheckPromise = null;
    lastCheckTime = 0;

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
        // Reset cache when receiving connection message
        connectionCheckPromise = null;
        lastCheckTime = 0;
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
