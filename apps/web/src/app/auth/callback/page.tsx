"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function AuthCallback() {
  const [status, setStatus] = useState("Completing sign in...");

  useEffect(() => {
    // Add timeout to close popup if callback takes too long
    const timeout = setTimeout(() => {
      setStatus("Authentication timed out");
      console.error("Callback timeout");
      if (window.opener) {
        window.opener.postMessage(
          {
            type: "AUTH_ERROR",
            error: "Authentication timed out. Please try again."
          },
          window.location.origin
        );
        setTimeout(() => window.close(), 2000);
      }
    }, 30000); // 30 second timeout

    const handleCallback = async () => {
      try {
        const {
          data: { session },
          error
        } = await supabase.auth.getSession();

        if (error) throw error;

        if (session && window.opener) {
          setStatus("Sign in successful!");
          // Send message to parent window
          window.opener.postMessage(
            { type: "AUTH_COMPLETE", session },
            window.location.origin
          );
          // Close popup after showing success message
          setTimeout(() => window.close(), 1000);
        } else if (!window.opener) {
          setStatus("No parent window found");
          console.error("No parent window found");
          // Redirect to home if opened directly
          window.location.href = "/";
        } else {
          throw new Error("No session found");
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Authentication failed";
        setStatus("Authentication failed");
        console.error("Auth callback error:", error);
        if (window.opener) {
          window.opener.postMessage(
            { type: "AUTH_ERROR", error: errorMessage },
            window.location.origin
          );
          // Show error message before closing
          setTimeout(() => window.close(), 2000);
        } else {
          // Redirect to home if opened directly
          window.location.href = "/";
        }
      }
    };

    handleCallback();

    return () => {
      clearTimeout(timeout);
    };
  }, []);

  return (
    <div className='flex min-h-screen items-center justify-center bg-background'>
      <div className='text-center space-y-2'>
        <p className='text-muted-foreground'>{status}</p>
        {status.includes("failed") && (
          <p className='text-sm text-destructive'>
            Please try signing in again
          </p>
        )}
      </div>
    </div>
  );
}
