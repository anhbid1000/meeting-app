"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import api, { rawApi } from "@/services/api";
import { useAuthStore } from "@/store/authStore";

export const useRequireAuth = () => {
  const router = useRouter();
  const { user, accessToken, setAuth, clearAuth } = useAuthStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const hydrate = async () => {
      try {
        if (!accessToken) {
          const response = await rawApi.post("/auth/refresh");
          setAuth(response.data.data.user, response.data.data.accessToken);
        } else if (!user) {
          const response = await api.get("/auth/me");
          setAuth(response.data.data.user, accessToken);
        }
      } catch {
        clearAuth();
        router.replace("/login");
        return;
      } finally {
        setLoading(false);
      }
    };

    void hydrate();
  }, [accessToken, clearAuth, router, setAuth, user]);

  return { user: useAuthStore((state) => state.user), loading };
};
