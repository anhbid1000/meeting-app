"use client";

import { Save, Upload, UserRound } from "lucide-react";
import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import api from "@/services/api";
import { useAuthStore } from "@/store/authStore";

export default function ProfilePage() {
  const { user, loading } = useRequireAuth();
  const setUser = useAuthStore((state) => state.setUser);
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setAvatar(user.avatar || "");
    }
  }, [user]);

  const updateProfile = async (event: FormEvent) => {
    event.preventDefault();
    setIsSaving(true);

    try {
      const response = await api.put("/users/profile", { name, avatar });
      setUser(response.data.data.user);
      toast.success("Da cap nhat ho so");
    } catch {
      toast.error("Khong the cap nhat ho so");
    } finally {
      setIsSaving(false);
    }
  };

  const uploadAvatar = async (file: File) => {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      toast.error("Thieu cau hinh Cloudinary");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);
    formData.append("folder", "meeting-app/avatars");

    setIsUploading(true);
    try {
      const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Tai len that bai");
      }

      const data = (await response.json()) as { secure_url: string };
      setAvatar(data.secure_url);
      toast.success("Da tai avatar len");
    } catch {
      toast.error("Khong the tai avatar len");
    } finally {
      setIsUploading(false);
    }
  };

  if (loading || !user) {
    return <main className="min-h-screen bg-[#f7f8fb] p-6 text-slate-700">Dang tai ho so...</main>;
  }

  return (
    <main className="min-h-screen bg-[#f7f8fb] px-[20px] py-[32px] text-slate-950">
      <section
        className="mx-auto rounded-[8px] border border-slate-200 bg-white p-[24px] shadow-sm"
        style={{ width: "min(100%, 672px)" }}
      >
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-emerald-700">Ho so</p>
            <h1 className="mt-1 text-2xl font-semibold">Ho so ca nhan</h1>
            <p className="mt-2 text-sm text-slate-600">{user.email}</p>
          </div>
          <div className="grid h-14 w-14 place-items-center overflow-hidden rounded-full bg-slate-100">
            {avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img alt={name} className="h-full w-full object-cover" src={avatar} />
            ) : (
              <UserRound className="h-7 w-7 text-slate-500" />
            )}
          </div>
        </div>

        <form className="space-y-4" onSubmit={updateProfile}>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Ho ten</span>
            <input
              className="mt-[4px] w-full rounded-[6px] border border-slate-300 px-[12px] py-[8px] text-sm outline-none focus:border-slate-900"
              onChange={(event) => setName(event.target.value)}
              value={name}
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Duong dan avatar</span>
            <input
              className="mt-[4px] w-full rounded-[6px] border border-slate-300 px-[12px] py-[8px] text-sm outline-none focus:border-slate-900"
              onChange={(event) => setAvatar(event.target.value)}
              placeholder="https://res.cloudinary.com/..."
              value={avatar}
            />
          </label>
          <label className="inline-flex cursor-pointer items-center gap-[8px] rounded-[6px] border border-slate-300 bg-white px-[16px] py-[10px] text-sm font-medium hover:border-slate-400">
            <Upload className="h-4 w-4" />
            {isUploading ? "Dang tai len..." : "Tai avatar len"}
            <input
              accept="image/*"
              className="hidden"
              disabled={isUploading}
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) {
                  void uploadAvatar(file);
                }
              }}
              type="file"
            />
          </label>
          <div className="flex flex-wrap gap-3">
            <button
              className="inline-flex items-center gap-[8px] rounded-[6px] bg-slate-950 px-[16px] py-[10px] text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
              disabled={isSaving}
              type="submit"
            >
              <Save className="h-4 w-4" />
              Luu ho so
            </button>
            <Link
              className="inline-flex items-center rounded-[6px] border border-slate-300 bg-white px-[16px] py-[10px] text-sm font-medium hover:border-slate-400"
              href="/dashboard"
            >
              Ve bang dieu khien
            </Link>
          </div>
        </form>
      </section>
    </main>
  );
}
