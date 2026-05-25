'use client';

import { useEffect, useMemo } from 'react';
import { useAuthStore } from '@/store/authStore';
import { applyDevAuthFromUrlOrFallback } from '@/lib/devAuth';
import { useSocket } from '@/hooks/useSocket';

export default function PresenceBootstrap() {
  const storeToken = useAuthStore((state) => state.accessToken);

  useEffect(() => {
    applyDevAuthFromUrlOrFallback();
  }, []);

  const token = storeToken;

  useSocket(token);

  return null;
}
