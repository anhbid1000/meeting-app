"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AxiosError } from "axios";
import { LockKeyhole, Mail, Video } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";
import { Suspense } from "react";
import GoogleAuthButton from "@/components/auth/GoogleAuthButton";
import { rawApi } from "@/services/api";
import { useAuthStore } from "@/store/authStore";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type LoginValues = z.infer<typeof loginSchema>;

const loginErrorMessages: Record<string, string> = {
  EMAIL_NOT_VERIFIED: "Please verify your email before signing in",
  INVALID_CREDENTIALS: "Incorrect email or password",
  LOGIN_RATE_LIMITED: "Too many failed sign-in attempts. Please try again later",
  VALIDATION_ERROR: "Please enter your email and password",
};

const getLoginErrorMessage = (error: AxiosError<{ code?: string; message?: string }>) => {
  const errorCode = error.response?.data?.code;

  if (errorCode && loginErrorMessages[errorCode]) {
    return loginErrorMessages[errorCode];
  }

  if (!error.response) {
    return "Unable to reach the server. Please check your connection and try again";
  }

  if (error.response.status === 401) {
    return "Incorrect email or password";
  }

  if (error.response.status === 403) {
    return "Please verify your email before signing in";
  }

  if (error.response.status === 400) {
    return "Please enter your email and password";
  }

  if (error.response.status >= 500) {
    return "Server is temporarily unavailable. Please try again later";
  }

  return "Sign-in failed. Please check your details and try again";
};

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");
  const setAuth = useAuthStore((state) => state.setAuth);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (values: LoginValues) => {
    try {
      const response = await rawApi.post("/auth/login", values);
      const { user, accessToken } = response.data.data;
      setAuth(user, accessToken);
      toast.success("Signed in successfully");
      router.replace(callbackUrl || "/dashboard");
    } catch (error) {
      const axiosError = error as AxiosError<{ code?: string; message?: string }>;
      toast.error(getLoginErrorMessage(axiosError));
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
            Welcome Back
          </h1>
          <p className="mt-[8px] max-w-[390px] text-[18px] leading-[26px] text-[#374151]">
            Sign in to securely access your workspace and upcoming meetings.
          </p>
        </div>

        <GoogleAuthButton text="continue_with" />

        <div className="my-[34px] flex items-center gap-[20px] text-[16px] text-[#374151]">
          <span className="h-px flex-1 bg-[#d6d9e2]" />
          <span>or continue with email</span>
          <span className="h-px flex-1 bg-[#d6d9e2]" />
        </div>

        <form className="space-y-[20px]" method="post" noValidate onSubmit={handleSubmit(onSubmit)}>
          <label className="block">
            <span className="text-[15px] font-semibold text-[#111827]">Work Email</span>
            <div className="mt-[8px] flex h-[52px] items-center gap-[12px] rounded-[8px] border border-[#bfc5d6] bg-[#fbfcff] px-[18px] focus-within:border-[#004ac6]">
              <Mail className="h-[22px] w-[22px] text-[#6b7280]" />
              <input
                {...register("email")}
                autoComplete="email"
                className="h-full w-full bg-transparent text-[17px] text-[#111827] outline-none placeholder:text-[#7b8191]"
                placeholder="name@company.com"
                type="email"
              />
            </div>
            {errors.email && <span className="mt-[6px] block text-[14px] text-red-600">{errors.email.message}</span>}
          </label>

          <label className="block">
            <div className="flex items-center justify-between">
              <span className="text-[15px] font-semibold text-[#111827]">Password</span>
              <Link className="text-[15px] font-semibold text-[#004ac6]" href="/forgot-password">
                Forgot password?
              </Link>
            </div>
            <div className="mt-[8px] flex h-[52px] items-center gap-[12px] rounded-[8px] border border-[#bfc5d6] bg-[#fbfcff] px-[18px] focus-within:border-[#004ac6]">
              <LockKeyhole className="h-[22px] w-[22px] text-[#6b7280]" />
              <input
                {...register("password")}
                autoComplete="current-password"
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
            {isSubmitting ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="mt-[24px] text-center text-[16px] text-[#6b7280]">
          Don&apos;t have an account?{" "}
          <Link className="font-semibold text-[#004ac6]" href="/register">
            Create account
          </Link>
        </p>
      </section>

      <footer className="mt-[228px] text-center text-[17px] text-[#6b7280]">
        <div className="flex items-center justify-center gap-[22px] text-[#374151]">
          <Link href="#">Terms of Service</Link>
          <span className="text-[#c0c5d3]">•</span>
          <Link href="#">Privacy Policy</Link>
        </div>
        <p className="mt-[16px]">Secure login provided by ViMeet Enterprise Core.</p>
      </footer>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
