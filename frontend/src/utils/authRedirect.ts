import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { rawApi } from "@/services/api";
import { useAuthStore } from "@/store/authStore";

export const goToAuthOrDashboard = async (router: AppRouterInstance, authPath = "/login") => {
  const { accessToken, isAuthenticated, setAuth } = useAuthStore.getState();

  if (accessToken || isAuthenticated) {
    router.push("/dashboard");
    return;
  }

  try {
    const response = await rawApi.post("/auth/refresh");
    const { user, accessToken: refreshedAccessToken } = response.data.data;
    setAuth(user, refreshedAccessToken);
    router.push("/dashboard");
  } catch {
    router.push(authPath);
  }
};
