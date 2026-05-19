"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, KeyRound, LockKeyhole, Video } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";
import api from "@/services/api";

const resetPasswordSchema = z.object({
  token: z.string().min(1, "Reset token is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordPage() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { token: "", password: "" },
  });

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get("token");
    if (token) {
      setValue("token", token);
    }
  }, [setValue]);

  const onSubmit = async (values: ResetPasswordValues) => {
    try {
      await api.post("/auth/reset-password", values);
      toast.success("Password has been reset");
      router.replace("/login");
    } catch {
      toast.error("Reset token is invalid or expired");
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#f4f5f7] px-[20px] py-[36px] text-[#111827]">
      <section
        className="relative overflow-hidden rounded-[12px] bg-white px-[40px] pb-[40px] pt-[36px] shadow-[0_24px_60px_rgba(15,23,42,0.08)]"
        style={{ width: "min(100%, 524px)" }}
      >
        <div className="absolute inset-x-0 top-0 h-[4px] bg-gradient-to-r from-[#0053db] to-[#bdc9ff]" />

        <div className="flex flex-col items-center text-center">
          <div className="grid h-[60px] w-[60px] place-items-center rounded-[16px] border border-[#c7d5ff] bg-[#edf3ff] text-[#004ac6]">
            <Video className="h-[30px] w-[30px]" strokeWidth={2.4} />
          </div>
          <p className="mt-[22px] text-[26px] font-bold leading-[32px] text-[#004ac6]">ViMeet</p>
          <h1 className="mt-[10px] text-[30px] font-semibold leading-[38px] tracking-[-0.01em]">
            Create New Password
          </h1>
          <p className="mt-[8px] max-w-[390px] text-[18px] leading-[26px] text-[#374151]">
            Paste your reset token and choose a new password for your account.
          </p>
        </div>

        <form className="mt-[42px] space-y-[20px]" onSubmit={handleSubmit(onSubmit)}>
          <label className="block">
            <span className="text-[15px] font-semibold text-[#111827]">Reset Token</span>
            <div className="mt-[8px] flex h-[52px] items-center gap-[12px] rounded-[8px] border border-[#bfc5d6] bg-[#fbfcff] px-[18px] focus-within:border-[#004ac6]">
              <KeyRound className="h-[22px] w-[22px] text-[#6b7280]" />
              <input
                {...register("token")}
                className="h-full w-full bg-transparent text-[17px] text-[#111827] outline-none placeholder:text-[#7b8191]"
                placeholder="Paste reset token"
              />
            </div>
            {errors.token && <span className="mt-[6px] block text-[14px] text-red-600">{errors.token.message}</span>}
          </label>

          <label className="block">
            <span className="text-[15px] font-semibold text-[#111827]">New Password</span>
            <div className="mt-[8px] flex h-[52px] items-center gap-[12px] rounded-[8px] border border-[#bfc5d6] bg-[#fbfcff] px-[18px] focus-within:border-[#004ac6]">
              <LockKeyhole className="h-[22px] w-[22px] text-[#6b7280]" />
              <input
                {...register("password")}
                className="h-full w-full bg-transparent text-[17px] text-[#111827] outline-none placeholder:text-[#7b8191]"
                placeholder="At least 8 characters"
                type="password"
              />
            </div>
            {errors.password && (
              <span className="mt-[6px] block text-[14px] text-red-600">{errors.password.message}</span>
            )}
          </label>

          <button
            className="h-[64px] w-full rounded-[8px] bg-[#0b55d9] text-[18px] font-semibold text-white transition hover:bg-[#004ac6] disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isSubmitting}
            type="submit"
          >
            {isSubmitting ? "Resetting..." : "Reset Password"}
          </button>
        </form>

        <Link
          className="mt-[24px] flex items-center justify-center gap-[8px] text-[16px] font-semibold text-[#004ac6]"
          href="/login"
        >
          <ArrowLeft className="h-[18px] w-[18px]" />
          Back to sign in
        </Link>
      </section>
    </main>
  );
}
