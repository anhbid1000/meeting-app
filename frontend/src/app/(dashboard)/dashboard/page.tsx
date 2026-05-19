"use client";

import { useAuthStore } from "@/store/authStore";

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user);
  const firstName = user?.name?.trim().split(/\s+/)[0] || "there";

  return (
    <div className="p-8">
      <h1 className="font-headline-lg text-headline-lg text-on-surface mb-4">
        Good morning, {firstName}
      </h1>
      <p className="font-body-md text-body-md text-on-surface-variant">
        Here&apos;s an overview of your active groups and channels.
      </p>

      {/* Dashboard content will be expanded by the workspace modules. */}
    </div>
  );
}
