"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, CheckCircle2, Mail, Video } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";
import api from "@/services/api";

const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = async (values: ForgotPasswordValues) => {
    try {
      await api.post("/auth/forgot-password", values);
      setSent(true);
      toast.success("Password reset instructions have been sent");
    } catch {
      toast.error("Unable to create a reset request");
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
            Reset Password
          </h1>
          <p className="mt-[8px] max-w-[390px] text-[18px] leading-[26px] text-[#374151]">
            Enter your work email and we will send a secure password reset link.
          </p>
        </div>

        <form className="mt-[42px] space-y-[20px]" onSubmit={handleSubmit(onSubmit)}>
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

          <button
            className="h-[64px] w-full rounded-[8px] bg-[#0b55d9] text-[18px] font-semibold text-white transition hover:bg-[#004ac6] disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isSubmitting}
            type="submit"
          >
            {isSubmitting ? "Sending..." : "Send Reset Instructions"}
          </button>
        </form>

        {sent && (
          <div className="mt-[22px] rounded-[8px] border border-[#c7d5ff] bg-[#f4f7ff] p-[16px]">
            <div className="flex items-start gap-[10px]">
              <CheckCircle2 className="mt-[2px] h-[20px] w-[20px] text-[#0b55d9]" />
              <div>
                <p className="text-[15px] font-semibold text-[#004ac6]">Check your email</p>
                <p className="mt-[6px] text-[14px] leading-[20px] text-[#374151]">
                  If an account exists for this email, a password reset link has been sent. The link expires in 15
                  minutes.
                </p>
              </div>
            </div>
          </div>
        )}

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
