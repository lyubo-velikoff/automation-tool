import { useEffect, useState, useCallback } from 'react';
import { createClientComponentClient, type Session } from '@supabase/auth-helpers-nextjs';

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [authWindow, setAuthWindow] = useState<Window | null>(null);
  
  const supabase = createClientComponentClient();

  useEffect(() => {
    // Check for initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });

    // Listen for messages from popup
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;

      if (event.data?.type === 'AUTH_COMPLETE') {
        setSession(event.data.session);
        if (authWindow) {
          authWindow.close();
          setAuthWindow(null);
        }
      }
    };

    window.addEventListener('message', handleMessage);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener('message', handleMessage);
    };
  }, [supabase.auth, authWindow]);

  const signIn = useCallback(() => {
    // Close any existing auth windows
    if (authWindow) {
      authWindow.close();
    }

    // Calculate popup position
    const width = 600;
    const height = 600;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;

    // Open popup
    const popup = window.open(
      '/auth/popup',
      'auth-popup',
      `width=${width},height=${height},left=${left},top=${top},popup=true`
    );

    if (popup) {
      setAuthWindow(popup);
    } else {
      console.error('Popup blocked! Please allow popups for this site.');
    }
  }, [authWindow]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setSession(null);
    // Close any open auth windows
    if (authWindow) {
      authWindow.close();
      setAuthWindow(null);
    }
  }, [supabase.auth, authWindow]);

  return {
    session,
    loading,
    signIn,
    signOut,
  };
} 
