import { useAuthStore } from '@/store/authStore';

type DevUser = {
  key: string;
  id: string;
  email: string;
  name?: string;
  token: string;
};

const readDevUsers = (): DevUser[] => {
  const raw = process.env.NEXT_PUBLIC_DEV_USERS;
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];

    const users = parsed.reduce<DevUser[]>((acc, item) => {
      const candidate = item as Partial<DevUser>;
      if (
        !candidate ||
        typeof candidate.key !== 'string' ||
        typeof candidate.id !== 'string' ||
        typeof candidate.email !== 'string' ||
        typeof candidate.token !== 'string'
      ) {
        return acc;
      }

      acc.push({
        key: candidate.key,
        id: candidate.id,
        email: candidate.email,
        name: candidate.name,
        token: candidate.token,
      });

      return acc;
    }, []);

    return users;
  } catch {
    return [];
  }
};

const applyUser = (user: DevUser) => {
  useAuthStore.getState().setDevUser({
    id: user.id,
    email: user.email,
    name: user.name || user.email,
    token: user.token,
  });

  localStorage.setItem('devUserKey', user.key);
};

export const applyDevAuthFromUrlOrFallback = () => {
  if (process.env.NODE_ENV !== 'development') return;
  if (typeof window === 'undefined') return;

  const params = new URLSearchParams(window.location.search);
  const requestedKey = (params.get('as') || params.get('devUser') || '')
    .trim()
    .toLowerCase();

  const devUsers = readDevUsers();
  if (requestedKey && devUsers.length > 0) {
    const picked = devUsers.find(
      (user) => user.key.toLowerCase() === requestedKey
    );
    if (picked) {
      applyUser(picked);
      return;
    }
  }

  const devToken = process.env.NEXT_PUBLIC_DEV_TOKEN;
  const devUserId = process.env.NEXT_PUBLIC_DEV_USER_ID;
  const devUserEmail = process.env.NEXT_PUBLIC_DEV_USER_EMAIL;
  const devUserName = process.env.NEXT_PUBLIC_DEV_USER_NAME;

  if (!devToken || !devUserId || !devUserEmail) return;

  useAuthStore.getState().setDevUser({
    id: devUserId,
    email: devUserEmail,
    name: devUserName || devUserEmail,
    token: devToken,
  });
};
