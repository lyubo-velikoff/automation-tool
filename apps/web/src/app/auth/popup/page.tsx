'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function AuthPopup() {
  const [status, setStatus] = useState('Signing you in...');

  useEffect(() => {
    const signInWithGitHub = async () => {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          skipBrowserRedirect: false,
        },
      });

      if (error) {
        setStatus('Authentication failed');
        console.error('OAuth error:', error);
        window.close();
      }
    };

    signInWithGitHub();
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center">
        <p className="text-muted-foreground">{status}</p>
      </div>
    </div>
  );
} 
