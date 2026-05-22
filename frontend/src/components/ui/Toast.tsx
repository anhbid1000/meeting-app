"use client";

import toast, { Toaster } from "react-hot-toast";

export type AppToastType = "success" | "error" | "info" | "warning";

type ToastPayload = {
  type?: AppToastType;
  message: string;
};

const toastClassNames: Record<AppToastType, string> = {
  success: "border-primary/30 bg-primary-container text-on-primary-container",
  error: "border-error/30 bg-error-container text-error",
  info: "border-outline-variant bg-surface-container-highest text-on-surface",
  warning: "border-tertiary/30 bg-tertiary-container text-on-tertiary-container",
};

const show = ({ type = "info", message }: ToastPayload) => {
  return toast.custom(
    (t) => (
      <div
        className={`pointer-events-auto rounded-xl border px-md py-sm font-label-md text-label-md shadow-lg backdrop-blur-sm transition-all duration-200 ${toastClassNames[type]} ${
          t.visible ? "translate-y-0 opacity-100" : "-translate-y-2 opacity-0"
        }`}
      >
        {message}
      </div>
    ),
    { duration: 2500 }
  );
};

export const appToast = {
  show,
  success: (message: string) => show({ type: "success", message }),
  error: (message: string) => show({ type: "error", message }),
  info: (message: string) => show({ type: "info", message }),
  warning: (message: string) => show({ type: "warning", message }),
  dismiss: toast.dismiss,
};

export const useToast = () => appToast;

export function AppToaster() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 2500,
      }}
      containerStyle={{
        top: 24,
        right: 24,
        zIndex: 70,
      }}
    />
  );
}
