import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export const useAuthRedirect = (redirectTo: string = '/workflows') => {
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.push(redirectTo);
      }
    };

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        router.push(redirectTo);
      }
    });

    checkAuth();

    return () => {
      subscription.unsubscribe();
    };
  }, [router, redirectTo]);

  return null;
}; 
