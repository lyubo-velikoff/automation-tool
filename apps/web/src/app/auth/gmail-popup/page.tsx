"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function GmailAuthPopup() {
  const [status, setStatus] = useState("Connecting to Gmail...");

  useEffect(() => {
    const connectToGmail = async () => {
      try {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: "google",
          options: {
            scopes: "https://www.googleapis.com/auth/gmail.modify",
            queryParams: {
              access_type: "offline",
              prompt: "consent"
            },
            redirectTo: `${window.location.origin}/auth/gmail-callback`,
            skipBrowserRedirect: false
          }
        });

        if (error) {
          setStatus("Connection failed");
          console.error("Gmail OAuth error:", error);
          setTimeout(() => window.close(), 2000);
        }
      } catch (error) {
        setStatus("Connection failed");
        console.error("Gmail connection error:", error);
        setTimeout(() => window.close(), 2000);
      }
    };

    connectToGmail();
  }, []);

  return (
    <div className='flex min-h-screen items-center justify-center bg-background'>
      <div className='text-center'>
        <p className='text-muted-foreground'>{status}</p>
      </div>
    </div>
  );
}
