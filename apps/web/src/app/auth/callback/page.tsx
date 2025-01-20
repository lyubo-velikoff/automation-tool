'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) throw error;

        if (session) {
          // If we're in a popup window
          if (window.opener) {
            // Try multiple methods to communicate with parent
            try {
              // Method 1: postMessage
              window.opener.postMessage(
                { type: 'AUTH_COMPLETE', session },
                window.location.origin
              );
            } catch (e) {
              console.error('Failed to post message:', e);
            }

            // Method 2: Set opener location directly
            try {
              window.opener.location.href = '/workflows';
            } catch (e) {
              console.error('Failed to set opener location:', e);
            }

            // Close popup after a short delay to ensure message is sent
            setTimeout(() => {
              window.close();
            }, 100);
          } else {
            // If not in popup, redirect current window
            router.push('/workflows');
          }
        }
      } catch (error) {
        console.error('Error in callback handler:', error);
        // Still try to close if we're in a popup
        if (window.opener) {
          window.close();
        }
      }
    };

    handleCallback();
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-semibold mb-4">Completing sign in...</h1>
        <p className="text-muted-foreground">You can close this window.</p>
      </div>
    </div>
  );
} 
