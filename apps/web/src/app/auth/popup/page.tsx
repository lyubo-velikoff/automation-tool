"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function AuthPopup() {
  const [status, setStatus] = useState("Signing you in...");

  useEffect(() => {
    // Add timeout to close popup if auth takes too long
    const timeout = setTimeout(() => {
      setStatus("Authentication timed out");
      console.error("Authentication timed out");
      window.close();
    }, 60000); // 60 second timeout

    const signInWithGitHub = async () => {
      try {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: "github",
          options: {
            redirectTo: `${window.location.origin}/auth/callback`,
            skipBrowserRedirect: false
          }
        });

        if (error) {
          setStatus("Authentication failed");
          console.error("OAuth error:", error);
          window.close();
        }
      } catch (error) {
        setStatus("Authentication failed");
        console.error("Unexpected error:", error);
        window.close();
      }
    };

    signInWithGitHub();

    return () => {
      clearTimeout(timeout);
    };
  }, []);

  return (
    <div className='flex min-h-screen items-center justify-center bg-background'>
      <div className='text-center'>
        <p className='text-muted-foreground'>{status}</p>
      </div>
    </div>
  );
}
