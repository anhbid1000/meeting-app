"use client";

import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import TopNav from "@/components/layout/TopNav";
import Hero from "@/components/landing/Hero";
import { Features } from "@/components/landing/Features";
import Footer from "@/components/landing/Footer";

export default function Home() {
  const [socketId, setSocketId] = useState("");

  useEffect(() => {
    const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
    const socket = io(BACKEND_URL);

    socket.on("connect", () => {
      setSocketId(socket.id ?? "");
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased flex flex-col">
      <TopNav />
      <main className="flex-grow">
        <Hero />
        <Features />
      </main>

      <Footer />
    </div>
  );
}
