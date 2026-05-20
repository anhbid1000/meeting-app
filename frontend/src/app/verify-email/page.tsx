"use client";

import { AxiosError } from "axios";
import { CheckCircle2, Loader2, XCircle, Video } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { rawApi } from "@/services/api";

type VerifyState = "loading" | "success" | "error";

const getTokenFromUrl = () => {
  const hashToken = new URLSearchParams(window.location.hash.replace(/^#/, "")).get("token");
  return hashToken || new URLSearchParams(window.location.search).get("token");
};

export default function VerifyEmailPage() {
  const [state, setState] = useState<VerifyState>("loading");
  const [errorMessage, setErrorMessage] = useState(
    "This verification link is invalid or has expired. Please request a new link."
  );

  useEffect(() => {
    const verify = async () => {
      const token = getTokenFromUrl();
      window.history.replaceState(null, "", window.location.pathname);

      if (!token) {
        setState("error");
        return;
      }

      try {
        await rawApi.post("/auth/verify-email", { token });
        setState("success");
      } catch (error) {
        const axiosError = error as AxiosError<{ code?: string }>;
        if (axiosError.response?.data?.code === "VERIFY_EMAIL_RATE_LIMITED") {
          setErrorMessage("Too many verification attempts. Please try again later.");
        }
        setState("error");
      }
    };

    void verify();
  }, []);

  const isSuccess = state === "success";

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#f4f5f7] px-[20px] py-[36px] text-[#111827]">
      <section
        className="relative overflow-hidden rounded-[12px] bg-white px-[40px] pb-[40px] pt-[36px] text-center shadow-[0_24px_60px_rgba(15,23,42,0.08)]"
        style={{ width: "min(100%, 524px)" }}
      >
        <div className="absolute inset-x-0 top-0 h-[4px] bg-gradient-to-r from-[#0053db] to-[#bdc9ff]" />

        <div className="flex flex-col items-center">
          <div className="grid h-[60px] w-[60px] place-items-center rounded-[16px] border border-[#c7d5ff] bg-[#edf3ff] text-[#004ac6]">
            <Video className="h-[30px] w-[30px]" strokeWidth={2.4} />
          </div>
          <p className="mt-[22px] text-[26px] font-bold leading-[32px] text-[#004ac6]">ViMeet</p>

          <div className="mt-[34px] grid h-[64px] w-[64px] place-items-center rounded-full bg-[#edf3ff]">
            {state === "loading" && <Loader2 className="h-[32px] w-[32px] animate-spin text-[#0b55d9]" />}
            {isSuccess && <CheckCircle2 className="h-[34px] w-[34px] text-[#0b55d9]" />}
            {state === "error" && <XCircle className="h-[34px] w-[34px] text-red-600" />}
          </div>

          <h1 className="mt-[20px] text-[30px] font-semibold leading-[38px] tracking-[-0.01em]">
            {state === "loading" && "Verifying Email"}
            {isSuccess && "Email Verified"}
            {state === "error" && "Verification Failed"}
          </h1>

          <p className="mt-[8px] max-w-[390px] text-[18px] leading-[26px] text-[#374151]">
            {state === "loading" && "Please wait while we verify your account."}
            {isSuccess && "Your email has been verified. You can now sign in to your workspace."}
            {state === "error" && errorMessage}
          </p>
        </div>

        <Link
          className="mt-[34px] inline-flex h-[56px] w-full items-center justify-center rounded-[8px] bg-[#0b55d9] text-[18px] font-semibold text-white transition hover:bg-[#004ac6]"
          href={isSuccess ? "/login" : "/register"}
        >
          {isSuccess ? "Back to Sign In" : "Back to Register"}
        </Link>
      </section>
    </main>
  );
}
