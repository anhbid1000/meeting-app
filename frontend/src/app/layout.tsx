import type { Metadata } from "next";
import { AppToaster } from "@/components/ui/Toast";
import UnifiedProgressBar from "@/components/ui/UnifiedProgressBar";
import "./globals.css";
import { Providers } from '@/components/providers/Providers';
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "ViMeet - Video Conferencing Platform",
  description: "High-fidelity video meetings with AI-powered summaries and real-time collaboration",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" suppressHydrationWarning data-scroll-behavior="smooth">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;900&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen flex flex-col antialiased">
        <Providers>
          <Suspense fallback={null}>
            <UnifiedProgressBar />
          </Suspense>
          {children}
          <AppToaster />
        </Providers>
      </body>
    </html>
  );
}
