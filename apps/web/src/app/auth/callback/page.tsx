'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function AuthCallback() {
  const [status, setStatus] = useState('Completing sign in...');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;

        if (session && window.opener) {
          setStatus('Closing window...');
          // Send message to parent window
          window.opener.postMessage(
            { type: 'AUTH_COMPLETE', session },
            window.location.origin
          );
          // Close popup
          window.close();
        }
      } catch (error) {
        setStatus('Authentication failed');
        console.error('Auth callback error:', error);
        if (window.opener) {
          window.close();
        }
      }
    };

    handleCallback();
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center">
        <p className="text-muted-foreground">{status}</p>
      </div>
    </div>
  );
} 
