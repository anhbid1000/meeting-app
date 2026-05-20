"use client";

import Script from "next/script";
import { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import toast from "react-hot-toast";
import { rawApi } from "@/services/api";
import { useAuthStore } from "@/store/authStore";

interface GoogleAuthButtonProps {
  text?: "signin_with" | "signup_with" | "continue_with";
}

type GoogleButtonStatus = "loading" | "ready" | "error";

const googleAuthErrorMessages: Record<string, string> = {
  GOOGLE_CONFIG_MISSING: "Google sign-in is not configured",
  GOOGLE_CREDENTIAL_REQUIRED: "Google sign-in did not return a credential",
  GOOGLE_EMAIL_NOT_VERIFIED: "Your Google email is not verified",
  GOOGLE_PROFILE_MISSING: "Unable to read your Google account information",
};

export default function GoogleAuthButton({ text = "continue_with" }: GoogleAuthButtonProps) {
  const router = useRouter();
  const buttonRef = useRef<HTMLDivElement>(null);
  const setAuth = useAuthStore((state) => state.setAuth);
  const [buttonStatus, setButtonStatus] = useState<GoogleButtonStatus>("loading");

  const renderButton = () => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

    if (!clientId) {
      setButtonStatus("error");
      toast.error("Google Client ID is missing");
      return;
    }

    if (!window.google || !buttonRef.current) {
      setButtonStatus("error");
      return;
    }

    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: async (response) => {
        try {
          const result = await rawApi.post("/auth/google", {
            credential: response.credential,
          });
          const { user, accessToken } = result.data.data;
          setAuth(user, accessToken);
          toast.success("Signed in with Google");
          router.replace("/dashboard");
        } catch (error) {
          const axiosError = error as AxiosError<{ code?: string }>;
          const errorCode = axiosError.response?.data?.code;
          toast.error((errorCode && googleAuthErrorMessages[errorCode]) || "Unable to sign in with Google");
        }
      },
    });

    buttonRef.current.innerHTML = "";
    window.google.accounts.id.renderButton(buttonRef.current, {
      theme: "outline",
      size: "large",
      width: "442",
      text,
    });
    setButtonStatus("ready");
  };

  return (
    <>
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onError={() => {
          setButtonStatus("error");
          toast.error("Unable to load Google sign-in");
        }}
        onReady={renderButton}
      />

      <div className="mt-[42px] flex h-[72px] w-full items-center justify-center rounded-[8px] border border-[#bfc5d6] bg-white transition hover:bg-[#f8fafc]">
        <div ref={buttonRef} />
        {buttonStatus !== "ready" && (
          <span className="text-[18px] font-medium text-[#111827]">
            {buttonStatus === "loading" ? "Loading Google sign-in..." : "Google sign-in is unavailable"}
          </span>
        )}
      </div>
    </>
  );
}
