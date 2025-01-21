"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function GmailCallback() {
  const [status, setStatus] = useState("Completing Gmail connection...");

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const {
          data: { session },
          error
        } = await supabase.auth.getSession();
        if (error) throw error;

        if (session && window.opener) {
          setStatus("Connection successful");
          // Send message to parent window
          window.opener.postMessage(
            { type: "GMAIL_CONNECTED", session },
            window.location.origin
          );
          // Close popup after a brief delay to show success message
          setTimeout(() => window.close(), 1000);
        }
      } catch (error) {
        setStatus("Connection failed");
        console.error("Gmail callback error:", error);
        if (window.opener) {
          window.opener.postMessage(
            { type: "GMAIL_ERROR", error: "Failed to connect to Gmail" },
            window.location.origin
          );
          setTimeout(() => window.close(), 2000);
        }
      }
    };

    handleCallback();
  }, []);

  return (
    <div className='flex min-h-screen items-center justify-center bg-background'>
      <div className='text-center'>
        <p className='text-muted-foreground'>{status}</p>
      </div>
    </div>
  );
}
