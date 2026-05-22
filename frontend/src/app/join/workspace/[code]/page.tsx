'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/services/api';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store/authStore';
import { useRequireAuth } from '@/hooks/useRequireAuth';

type InviteDetail = {
  _id: string;
  code: string;
  status: string;
  workspace: {
    _id: string;
    name: string;
    slug: string;
    description?: string;
  };
};

export default function JoinWorkspacePage() {
  const params = useParams<{ code: string }>();
  const code = params?.code;
  const router = useRouter();
  const { loading: authLoading } = useRequireAuth();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [invite, setInvite] = useState<InviteDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [joinResult, setJoinResult] = useState<null | { type: 'pending' | 'joined'; message: string }>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated && code) {
      router.push(`/login?callbackUrl=${encodeURIComponent(`/join/workspace/${code}`)}`);
      return;
    }
  }, [isAuthenticated, router, code, authLoading]);

  useEffect(() => {
    if (!code || !isAuthenticated) return;

    const fetchInvite = async () => {
      try {
        const res = await api.get(`/workspace-invites/${code}`);
        setInvite(res.data ?? null);
      } catch (e) {
        console.error(e);
        setError('Link mời không hợp lệ hoặc đã hết hạn');
      } finally {
        setLoading(false);
      }
    };

    fetchInvite();
  }, [code, isAuthenticated]);

  const handleJoin = async () => {
    if (!invite || !code) return;
    if (!isAuthenticated) {
      router.push(`/login?callbackUrl=${encodeURIComponent(`/join/workspace/${code}`)}`);
      return;
    }

    try {
      setIsJoining(true);
      const res = await api.post(`/workspace-invites/${code}/accept`);
      const message = String(res?.data?.message || '');
      const isPending = message.toLowerCase().includes('chờ duyệt');

      if (isPending) {
        setJoinResult({ type: 'pending', message: message || 'Yêu cầu tham gia của bạn đang chờ duyệt.' });
        toast.success('Đã gửi yêu cầu tham gia. Vui lòng chờ duyệt! Sẽ chuyển về dashboard sau 5 giây.');
        window.setTimeout(() => {
          router.push('/groups');
        }, 5000);
        return;
      }

      setJoinResult({ type: 'joined', message: message || 'Tham gia workspace thành công!' });
      toast.success('Tham gia workspace thành công!');
      router.push('/groups');
    } catch (e: any) {
      console.error(e);
      const apiMessage = e?.response?.data?.message;
      toast.error(apiMessage || 'Tham gia thất bại. Vui lòng thử lại.');
    } finally {
      setIsJoining(false);
    }
  };

  if (authLoading || !isAuthenticated) return null; // Wait for redirect or hydration

  if (loading) return <div className="p-lg">Đang tải...</div>;
  if (error) return <div className="p-lg text-error">{error}</div>;

  return (
    <div className="p-lg max-w-2xl mx-auto flex flex-col items-center justify-center min-h-[50vh]">
      <div className="bg-surface-container-lowest p-xl rounded-2xl border border-outline-variant shadow-sm w-full text-center">
        <h2 className="font-headline-lg mb-sm text-on-surface">Tham gia workspace</h2>
        <p className="mb-lg text-on-surface-variant text-body-lg">
          Bạn được mời tham gia vào workspace <strong className="text-on-surface font-semibold">{invite?.workspace?.name}</strong>.
        </p>
        {joinResult?.type === 'pending' && (
          <div className="mb-md rounded-xl border border-amber-300/40 bg-amber-100/60 px-4 py-3 text-amber-900 text-sm text-left">
            {joinResult.message}
          </div>
        )}

        <button
          onClick={handleJoin}
          disabled={isJoining || joinResult?.type === 'pending'}
          className="bg-primary text-on-primary px-xl py-sm rounded-lg hover:bg-primary/90 transition-colors font-label-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isJoining
            ? 'Đang tham gia...'
            : joinResult?.type === 'pending'
              ? 'Đang chờ duyệt'
              : 'Chấp nhận tham gia'}
        </button>
      </div>
    </div>
  );
}
