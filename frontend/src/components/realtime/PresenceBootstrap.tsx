'use client';

import { useEffect, useMemo } from 'react';
import { useAuthStore } from '@/store/authStore';
import { applyDevAuthFromUrlOrFallback } from '@/lib/devAuth';
import { useSocket } from '@/hooks/useSocket';

export default function PresenceBootstrap() {
  const storeToken = useAuthStore((state) => state.token);

  useEffect(() => {
    applyDevAuthFromUrlOrFallback();
  }, []);

  const token = useMemo(() => {
    if (typeof window === 'undefined') return null;
    const persisted = localStorage.getItem('accessToken');
    if (persisted) return persisted;
    return storeToken;
  }, [storeToken]);

  useSocket(token);

  return null;
}
