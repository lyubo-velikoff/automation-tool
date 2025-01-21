'use client';

import { useEffect, useState, useCallback } from 'react';
import { type Session } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [authWindow, setAuthWindow] = useState<Window | null>(null);
  const router = useRouter();

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
        if (authWindow && !authWindow.closed) {
          authWindow.close();
        }
        setAuthWindow(null);
        // Add back redirection only for popup authentication completion
        router.push('/workflows');
      }
    };

    window.addEventListener('message', handleMessage);

    // Check if auth window is still open periodically
    const checkAuthWindow = setInterval(() => {
      if (authWindow && authWindow.closed) {
        setAuthWindow(null);
      }
    }, 1000);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener('message', handleMessage);
      clearInterval(checkAuthWindow);
      // Close auth window if component unmounts
      if (authWindow && !authWindow.closed) {
        authWindow.close();
      }
    };
  }, [authWindow, router]);

  const signIn = useCallback(() => {
    // Close any existing auth windows
    if (authWindow && !authWindow.closed) {
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
    if (authWindow && !authWindow.closed) {
      authWindow.close();
    }
    setAuthWindow(null);
    // Navigate to home page after sign out
    router.push('/');
  }, [authWindow, router]);

  return {
    session,
    loading,
    signIn,
    signOut,
  };
} 
