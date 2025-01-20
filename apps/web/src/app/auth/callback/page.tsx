'use client';

import { useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const supabase = createClientComponentClient();

    const handleCallback = async () => {
      console.log('Auth callback handler started...');
      try {
        console.log('Getting session from Supabase...');
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.error('Error getting session:', error);
          throw error;
        }

        console.log('Session retrieved:', session ? 'Session exists' : 'No session');
        if (session) {
          if (window.opener) {
            console.log('Sending session data to parent window...');
            window.opener.postMessage(
              { type: 'AUTH_COMPLETE', session },
              window.location.origin
            );
            console.log('Redirecting parent window to /workflows...');
            window.opener.location.href = '/workflows';
            console.log('Closing popup window...');
            window.close();
          } else {
            console.log('No opener window found, redirecting current window...');
            router.push('/workflows');
          }
        } else {
          console.error('No session found after authentication');
        }
      } catch (error) {
        console.error('Error in callback handler:', error);
      } finally {
        if (window.opener) {
          console.log('Ensuring popup window is closed...');
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
