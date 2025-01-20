'use client';

import { useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function AuthPopup() {
  useEffect(() => {
    const supabase = createClientComponentClient();

    const signInWithGitHub = async () => {
      console.log('Starting GitHub OAuth sign-in...');
      try {
        console.log('Calling Supabase signInWithOAuth...');
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'github',
          options: {
            skipBrowserRedirect: false,
          },
        });

        if (error) {
          console.error('OAuth sign-in error:', error);
          window.close();
          throw error;
        }
      } catch (error) {
        console.error('Unexpected error during sign-in:', error);
        window.close();
      }
    };

    signInWithGitHub();
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-semibold mb-4">Signing in with GitHub...</h1>
        <p className="text-muted-foreground">You will be redirected shortly.</p>
      </div>
    </div>
  );
} 
