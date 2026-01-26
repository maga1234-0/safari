'use client';

import { useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/firebase';
import { useToast } from '@/hooks/use-toast';

const TIMEOUT_DURATION = 5 * 60 * 1000; // 5 minutes

export function useSessionTimeout() {
  const auth = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const logout = useCallback(() => {
    if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
    }
    if (auth && router) {
      auth.signOut().then(() => {
        toast({
          variant: 'destructive',
          title: 'Session Expirée',
          description: 'Vous avez été déconnecté pour inactivité.',
        });
        router.push('/login');
      });
    }
  }, [auth, router, toast]);

  const resetTimeout = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(logout, TIMEOUT_DURATION);
  }, [logout]);

  useEffect(() => {
    if (!auth) return;

    const events: (keyof WindowEventMap)[] = ['mousemove', 'keydown', 'click', 'scroll'];

    resetTimeout();

    events.forEach(event => {
      window.addEventListener(event, resetTimeout);
    });

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      events.forEach(event => {
        window.removeEventListener(event, resetTimeout);
      });
    };
  }, [resetTimeout, auth]);
}
