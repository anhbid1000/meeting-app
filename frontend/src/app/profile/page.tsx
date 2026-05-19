"use client";

import { CalendarClock, Cloud, EyeOff, Pencil, Save, Settings, Upload, Video } from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import Sidebar from "@/components/layout/SideBar";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import api from "@/services/api";
import { useAuthStore } from "@/store/authStore";

const splitName = (fullName: string) => {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length <= 1) {
    return { firstName: parts[0] || "", lastName: "" };
  }

  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(" "),
  };
};

export default function ProfilePage() {
  const { user, loading } = useRequireAuth();
  const setUser = useAuthStore((state) => state.setUser);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [avatar, setAvatar] = useState("");
  const [jobTitle, setJobTitle] = useState("Workspace member");
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (user) {
      const name = splitName(user.name);
      setFirstName(name.firstName);
      setLastName(name.lastName);
      setAvatar(user.avatar || "");
    }
  }, [user]);

  const displayName = useMemo(() => {
    const name = `${firstName} ${lastName}`.trim();
    return name || user?.name || "Workspace Member";
  }, [firstName, lastName, user?.name]);

  const updateProfile = async (event: FormEvent) => {
    event.preventDefault();
    setIsSaving(true);

    try {
      const response = await api.put("/users/profile", {
        name: displayName,
        avatar,
      });
      setUser(response.data.data.user);
      toast.success("Profile updated");
    } catch {
      toast.error("Unable to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const uploadAvatar = async (file: File) => {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      toast.error("Cloudinary configuration is missing");
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
        throw new Error("Upload failed");
      }

      const data = (await response.json()) as { secure_url: string };
      setAvatar(data.secure_url);
      toast.success("Avatar uploaded");
    } catch {
      toast.error("Unable to upload avatar");
    } finally {
      setIsUploading(false);
    }
  };

  if (loading || !user) {
    return <main className="min-h-screen bg-[#f4f6fa] p-8 text-[#1f2937]">Loading profile...</main>;
  }

  return (
    <div className="min-h-screen bg-[#f4f6fa] text-[#111827]">
      <Sidebar />

      <main className="min-h-screen px-[24px] py-[44px] md:ml-sidebar_width md:px-[40px] lg:px-[64px]">
        <div className="mx-auto max-w-[1170px]">
          <header className="mb-[34px]">
            <h1 className="text-[40px] font-semibold leading-[48px] tracking-normal text-[#111827]">
              Profile Settings
            </h1>
            <p className="mt-[8px] text-[20px] leading-[28px] text-[#253044]">
              Manage your personal information and preferences.
            </p>
          </header>

          <div className="grid gap-[30px] lg:grid-cols-[minmax(0,1fr)_370px]">
            <section className="space-y-[30px]">
              <div className="rounded-[12px] border border-[#c0c8da] bg-[#f9fbff] p-[32px] shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
                <div className="flex flex-col gap-[24px] sm:flex-row sm:items-center">
                  <div className="relative h-[112px] w-[112px] shrink-0 overflow-visible rounded-full bg-[#e8eef8]">
                    {avatar ? (
                      <img
                        alt={displayName}
                        className="h-full w-full rounded-full object-cover"
                        src={avatar}
                      />
                    ) : (
                      <div className="grid h-full w-full place-items-center rounded-full bg-[#dbe7ff] text-[42px] font-semibold text-[#0b55d9]">
                        {displayName.charAt(0).toUpperCase()}
                      </div>
                    )}

                    <label className="absolute bottom-[-4px] right-[-4px] grid h-[42px] w-[42px] cursor-pointer place-items-center rounded-full border border-[#c0c8da] bg-white text-[#1f2937] shadow-sm transition hover:border-[#0b55d9] hover:text-[#0b55d9]">
                      {isUploading ? <Upload className="h-[18px] w-[18px]" /> : <Pencil className="h-[18px] w-[18px]" />}
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
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-[12px]">
                      <h2 className="text-[30px] font-semibold leading-[38px] text-[#111827]">{displayName}</h2>
                      <span className="inline-flex items-center gap-[6px] rounded-full bg-[#dbe9fb] px-[12px] py-[6px] text-[15px] font-medium text-[#526072]">
                        <Settings className="h-[16px] w-[16px]" />
                        Pro Tier
                      </span>
                    </div>
                    <p className="mt-[8px] text-[20px] leading-[28px] text-[#253044]">{user.email}</p>
                    <p className="mt-[20px] max-w-[620px] text-[18px] leading-[26px] text-[#253044]">
                      {jobTitle} in ViMeet workspace. Keep your account details current for smoother collaboration.
                    </p>
                  </div>
                </div>
              </div>

              <form
                className="rounded-[12px] border border-[#c0c8da] bg-[#f9fbff] p-[32px] shadow-[0_1px_2px_rgba(15,23,42,0.04)]"
                onSubmit={updateProfile}
              >
                <h2 className="text-[28px] font-semibold leading-[36px] text-[#111827]">Personal Information</h2>

                <div className="mt-[24px] grid gap-[20px] sm:grid-cols-2">
                  <label className="block">
                    <span className="text-[17px] font-medium text-[#253044]">First Name</span>
                    <input
                      className="mt-[8px] h-[52px] w-full rounded-[8px] border border-[#bfc5d6] bg-[#fbfcff] px-[20px] text-[20px] text-[#111827] outline-none transition focus:border-[#0b55d9]"
                      onChange={(event) => setFirstName(event.target.value)}
                      value={firstName}
                    />
                  </label>

                  <label className="block">
                    <span className="text-[17px] font-medium text-[#253044]">Last Name</span>
                    <input
                      className="mt-[8px] h-[52px] w-full rounded-[8px] border border-[#bfc5d6] bg-[#fbfcff] px-[20px] text-[20px] text-[#111827] outline-none transition focus:border-[#0b55d9]"
                      onChange={(event) => setLastName(event.target.value)}
                      value={lastName}
                    />
                  </label>
                </div>

                <label className="mt-[20px] block">
                  <span className="text-[17px] font-medium text-[#253044]">Email Address</span>
                  <input
                    className="mt-[8px] h-[52px] w-full rounded-[8px] border border-[#bfc5d6] bg-[#fbfcff] px-[20px] text-[20px] text-[#111827] outline-none"
                    readOnly
                    value={user.email}
                  />
                </label>

                <label className="mt-[20px] block">
                  <span className="text-[17px] font-medium text-[#253044]">Job Title</span>
                  <input
                    className="mt-[8px] h-[52px] w-full rounded-[8px] border border-[#bfc5d6] bg-[#fbfcff] px-[20px] text-[20px] text-[#111827] outline-none transition focus:border-[#0b55d9]"
                    onChange={(event) => setJobTitle(event.target.value)}
                    value={jobTitle}
                  />
                </label>

                <div className="mt-[30px] flex justify-end">
                  <button
                    className="inline-flex h-[46px] min-w-[182px] items-center justify-center gap-[10px] rounded-[8px] bg-[#0b55d9] px-[22px] text-[18px] font-semibold text-white transition hover:bg-[#004ac6] disabled:cursor-not-allowed disabled:opacity-60"
                    disabled={isSaving}
                    type="submit"
                  >
                    <Save className="h-[18px] w-[18px]" />
                    {isSaving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            </section>

            <aside className="space-y-[30px]">
              <section className="rounded-[12px] border border-[#c0c8da] bg-[#f9fbff] p-[22px] shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
                <h2 className="text-[26px] font-semibold leading-[34px] text-[#111827]">Connected Accounts</h2>
                <div className="mt-[22px] flex items-center justify-between rounded-[8px] border border-[#c0c8da] bg-[#f4f6fa] px-[12px] py-[14px]">
                  <div className="flex items-center gap-[16px]">
                    <div className="grid h-[42px] w-[42px] place-items-center rounded-full bg-white text-[22px] font-semibold text-[#4285f4]">
                      G
                    </div>
                    <div>
                      <p className="text-[18px] font-medium leading-[24px] text-[#111827]">Google Workspace</p>
                      <p className="text-[16px] leading-[22px] text-[#253044]">Not connected</p>
                    </div>
                  </div>
                  <EyeOff className="h-[22px] w-[22px] text-[#253044]" />
                </div>
              </section>

              <section className="rounded-[12px] border border-[#c0c8da] bg-[#f9fbff] p-[22px] shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
                <div className="flex items-center justify-between">
                  <h2 className="text-[26px] font-semibold leading-[34px] text-[#111827]">Storage Usage</h2>
                  <Cloud className="h-[26px] w-[26px] text-[#253044]" />
                </div>
                <div className="mt-[16px] flex items-center justify-between text-[17px] text-[#253044]">
                  <span>0 GB used</span>
                  <span>100 GB total</span>
                </div>
                <div className="mt-[8px] h-[10px] overflow-hidden rounded-full bg-[#e5e7eb]">
                  <div className="h-full w-[3%] rounded-full bg-[#0b55d9]" />
                </div>
                <button
                  className="mt-[22px] h-[48px] w-full rounded-[8px] bg-[#d7e6fa] text-[18px] font-medium text-[#526072]"
                  type="button"
                >
                  Upgrade Storage
                </button>
              </section>

              <section className="rounded-[12px] border border-[#c0c8da] bg-[#f9fbff] p-[22px] shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
                <h2 className="text-[26px] font-semibold leading-[34px] text-[#111827]">Weekly Activity</h2>
                <div className="mt-[22px] grid grid-cols-2 gap-[12px]">
                  <div className="rounded-[8px] border border-[#d0d7e6] bg-[#f4f6fa] p-[12px]">
                    <Video className="h-[24px] w-[24px] text-[#0b55d9]" />
                    <p className="mt-[16px] text-[30px] font-semibold leading-[34px] text-[#111827]">0</p>
                    <p className="text-[17px] text-[#253044]">Meetings</p>
                  </div>
                  <div className="rounded-[8px] border border-[#d0d7e6] bg-[#f4f6fa] p-[12px]">
                    <CalendarClock className="h-[24px] w-[24px] text-[#0b55d9]" />
                    <p className="mt-[16px] text-[30px] font-semibold leading-[34px] text-[#111827]">0h</p>
                    <p className="text-[17px] text-[#253044]">Time in calls</p>
                  </div>
                </div>
              </section>
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}
