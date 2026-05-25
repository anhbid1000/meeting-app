"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname, useSearchParams } from "next/navigation";

export default function UnifiedProgressBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const isFirstRender = useRef(true);

  // Kiểm tra xem có đang ở trang dashboard hay không để chừa chỗ cho Sidebar
  const isDashboard = pathname?.includes("/(dashboard)") || 
                      pathname?.startsWith("/dashboard") || 
                      pathname?.startsWith("/files") || 
                      pathname?.startsWith("/groups") || 
                      pathname?.startsWith("/history") || 
                      pathname?.startsWith("/meetings") ||
                      pathname?.startsWith("/channels");

  useEffect(() => {
    // Không chạy ở lần đầu tiên load trang (vì trình duyệt đã có thanh load riêng)
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 700);
    return () => clearTimeout(timer);
  }, [pathname, searchParams]);

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          className={`fixed top-0 right-0 z-[100] h-[3px] bg-transparent pointer-events-none transition-all duration-300 ${
            isDashboard ? "md:left-[280px] left-0" : "left-0"
          }`}
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.25 } }}
        >
          {/* Main Progress Line */}
          <motion.div
            className="h-full bg-primary relative"
            initial={{ width: "0%" }}
            animate={{ width: ["0%", "30%", "70%", "100%"] }}
            transition={{ duration: 0.7, ease: "easeInOut" }}
          >
            {/* Glow Effect */}
            <div className="absolute right-0 top-0 h-full w-20 bg-gradient-to-r from-transparent to-primary blur-[4px] shadow-[0_0_10px_#2563eb]" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
