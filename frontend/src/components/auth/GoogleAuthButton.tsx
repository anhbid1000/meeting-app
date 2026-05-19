"use client";

import Script from "next/script";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import toast from "react-hot-toast";
import api from "@/services/api";
import { useAuthStore } from "@/store/authStore";

interface GoogleAuthButtonProps {
  text?: "signin_with" | "signup_with" | "continue_with";
}

export default function GoogleAuthButton({ text = "continue_with" }: GoogleAuthButtonProps) {
  const router = useRouter();
  const buttonRef = useRef<HTMLDivElement>(null);
  const setAuth = useAuthStore((state) => state.setAuth);
  const [scriptReady, setScriptReady] = useState(false);

  const renderButton = () => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

    if (!clientId) {
      toast.error("Google Client ID is missing");
      return;
    }

    if (!window.google || !buttonRef.current) {
      return;
    }

    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: async (response) => {
        try {
          const result = await api.post("/auth/google", {
            credential: response.credential,
          });
          const { user, accessToken } = result.data.data;
          setAuth(user, accessToken);
          toast.success("Signed in with Google");
          router.replace("/dashboard");
        } catch {
          toast.error("Unable to sign in with Google");
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
    setScriptReady(true);
  };

  return (
    <>
      <Script src="https://accounts.google.com/gsi/client" strategy="afterInteractive" onLoad={renderButton} />

      <div className="mt-[42px] flex h-[72px] w-full items-center justify-center rounded-[8px] border border-[#bfc5d6] bg-white transition hover:bg-[#f8fafc]">
        <div ref={buttonRef} />
        {!scriptReady && <span className="text-[18px] font-medium text-[#111827]">Continue with Google</span>}
      </div>
    </>
  );
}
