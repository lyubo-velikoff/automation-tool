'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';

// Dynamically import the loading spinner
const Loader2 = dynamic(() => import('lucide-react').then(mod => mod.Loader2), {
  ssr: false,
  loading: () => <span className="animate-pulse">...</span>
});

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${window.location.origin}/workflows`,
          scopes: 'read:user user:email'
        }
      });
    } catch (error) {
      console.error('Login failed:', error);
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Please log in to continue</h1>
      <Suspense fallback={<Button disabled>Loading...</Button>}>
        <Button onClick={handleLogin} disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Signing in...
            </>
          ) : (
            'Login with GitHub'
          )}
        </Button>
      </Suspense>
    </div>
  );
}
