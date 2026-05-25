"use client";

import { ReactNode } from "react";
import { useRequireAuth } from "@/hooks/useRequireAuth";

interface AuthGuardProps {
  children: ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const { loading } = useRequireAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-on-surface">
        Loading workspace...
      </div>
    );
  }

  return <>{children}</>;
}
