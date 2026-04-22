"use client";

import { useEffect, useState } from "react";
import { io } from "socket.io-client";

export default function Home() {
  const [socketId, setSocketId] = useState("");

  useEffect(() => {
    // Kết nối tới cổng của Backend
    const BACKEND_URL =
      process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
    const socket = io(BACKEND_URL);

    socket.on("connect", () => {
      console.log("Đã kết nối Socket thành công!");
      setSocketId(socket.id ?? "");
    });

    // Dọn dẹp (cleanup) khi tắt component
    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <h1 className="text-3xl font-bold mb-4">MERN Video Conference Test</h1>
      <div>
        <h1>Đang kết nối tới: {process.env.NEXT_PUBLIC_BACKEND_URL}</h1>
      </div>
      <p className="text-lg">
        Trạng thái Socket.io:{" "}
        {socketId ? (
          <span className="text-green-600 font-bold">
            🟢 Đã kết nối (ID: {socketId})
          </span>
        ) : (
          <span className="text-red-600 font-bold">🔴 Đang chờ kết nối...</span>
        )}
      </p>
    </div>
  );
}
