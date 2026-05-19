"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, LockKeyhole, Mail, UserRound, Video } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";
import GoogleAuthButton from "@/components/auth/GoogleAuthButton";
import api from "@/services/api";

const registerSchema = z.object({
  name: z.string().min(2, "Ten toi thieu 2 ky tu"),
  email: z.string().email("Email khong hop le"),
  password: z.string().min(8, "Mat khau toi thieu 8 ky tu"),
});

type RegisterValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const [registeredEmail, setRegisteredEmail] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "" },
  });

  const onSubmit = async (values: RegisterValues) => {
    try {
      await api.post("/auth/register", values);
      setRegisteredEmail(values.email);
      toast.success("Check your email to verify your account");
    } catch {
      toast.error("Khong the tao tai khoan voi email nay");
    }
  };

  const resendVerification = async () => {
    if (!registeredEmail) return;

    try {
      await api.post("/auth/resend-verification", { email: registeredEmail });
      toast.success("Verification email sent");
    } catch {
      toast.error("Unable to resend verification email");
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
            Create Account
          </h1>
          <p className="mt-[8px] max-w-[390px] text-[18px] leading-[26px] text-[#374151]">
            Join your workspace and start managing secure meetings.
          </p>
        </div>

        <GoogleAuthButton text="signup_with" />

        <div className="my-[34px] flex items-center gap-[20px] text-[16px] text-[#374151]">
          <span className="h-px flex-1 bg-[#d6d9e2]" />
          <span>or continue with email</span>
          <span className="h-px flex-1 bg-[#d6d9e2]" />
        </div>

        {registeredEmail && (
          <div className="mb-[24px] rounded-[8px] border border-[#c7d5ff] bg-[#f4f7ff] p-[16px]">
            <div className="flex items-start gap-[10px]">
              <CheckCircle2 className="mt-[2px] h-[20px] w-[20px] text-[#0b55d9]" />
              <div>
                <p className="text-[15px] font-semibold text-[#004ac6]">Check your email</p>
                <p className="mt-[6px] text-[14px] leading-[20px] text-[#374151]">
                  We sent a verification link to {registeredEmail}. Please verify your account before signing in.
                </p>
                <button
                  className="mt-[10px] text-[14px] font-semibold text-[#004ac6]"
                  onClick={resendVerification}
                  type="button"
                >
                  Resend verification email
                </button>
              </div>
            </div>
          </div>
        )}

        <form className="space-y-[20px]" onSubmit={handleSubmit(onSubmit)}>
          <label className="block">
            <span className="text-[15px] font-semibold text-[#111827]">Full Name</span>
            <div className="mt-[8px] flex h-[52px] items-center gap-[12px] rounded-[8px] border border-[#bfc5d6] bg-[#fbfcff] px-[18px] focus-within:border-[#004ac6]">
              <UserRound className="h-[22px] w-[22px] text-[#6b7280]" />
              <input
                {...register("name")}
                className="h-full w-full bg-transparent text-[17px] text-[#111827] outline-none placeholder:text-[#7b8191]"
                placeholder="Nguyen Van A"
              />
            </div>
            {errors.name && <span className="mt-[6px] block text-[14px] text-red-600">{errors.name.message}</span>}
          </label>

          <label className="block">
            <span className="text-[15px] font-semibold text-[#111827]">Work Email</span>
            <div className="mt-[8px] flex h-[52px] items-center gap-[12px] rounded-[8px] border border-[#bfc5d6] bg-[#fbfcff] px-[18px] focus-within:border-[#004ac6]">
              <Mail className="h-[22px] w-[22px] text-[#6b7280]" />
              <input
                {...register("email")}
                className="h-full w-full bg-transparent text-[17px] text-[#111827] outline-none placeholder:text-[#7b8191]"
                placeholder="name@company.com"
                type="email"
              />
            </div>
            {errors.email && <span className="mt-[6px] block text-[14px] text-red-600">{errors.email.message}</span>}
          </label>

          <label className="block">
            <span className="text-[15px] font-semibold text-[#111827]">Password</span>
            <div className="mt-[8px] flex h-[52px] items-center gap-[12px] rounded-[8px] border border-[#bfc5d6] bg-[#fbfcff] px-[18px] focus-within:border-[#004ac6]">
              <LockKeyhole className="h-[22px] w-[22px] text-[#6b7280]" />
              <input
                {...register("password")}
                className="h-full w-full bg-transparent text-[17px] text-[#111827] outline-none placeholder:text-[#7b8191]"
                placeholder="••••••••"
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
            {isSubmitting ? "Creating..." : "Create Account"}
          </button>
        </form>

        <p className="mt-[24px] text-center text-[16px] text-[#6b7280]">
          Already have an account?{" "}
          <Link className="font-semibold text-[#004ac6]" href="/login">
            Sign in
          </Link>
        </p>
      </section>
    </main>
  );
}
