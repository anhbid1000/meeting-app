"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { goToAuthOrDashboard } from "@/utils/authRedirect";

export default function Hero() {
  const router = useRouter();

  return (
    <section className="relative pt-24 pb-32 px-6 overflow-hidden bg-surface-container-lowest">
      {/* Gradient + pattern background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-fixed/30 to-surface-container-lowest/10 pointer-events-none" />
      <div className="absolute right-0 top-0 w-1/2 h-full bg-pattern opacity-40 pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        {/* Left – text */}
        <div className="flex flex-col gap-6">
          <h1 className="font-display text-display text-on-surface">
            Lên lịch họp, nhắn tin{" và "}
            <span className="text-primary">tóm tắt AI</span>
          </h1>

          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-3xl">
            Nâng cao năng suất làm việc nhóm của bạn với ViMeet. Các cuộc họp video chất lượng cao, cộng tác thời gian thực và tóm tắt được hỗ trợ bởi AI, tất cả trong một không gian làm việc thống nhất được thiết kế dành cho các chuyên gia hiện đại.
          </p>

          <div className="flex flex-wrap gap-4 mt-4">
            <button
              className="bg-primary text-on-primary font-label-md text-label-md px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors shadow-md flex items-center gap-2"
              onClick={() => goToAuthOrDashboard(router, "/register")}
              type="button"
            >
              Bắt đầu miễn phí
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </button>

            <a
              href="#features"
              className="bg-transparent border-2 border-outline-variant text-primary font-label-md text-label-md px-6 py-2 rounded-lg hover:border-primary hover:bg-surface-variant/50 transition-colors"
            >
              Các tính năng nổi bật
            </a>
          </div>

          <div className="flex items-center gap-4 mt-6 text-secondary font-body-sm">
            <span className="material-symbols-outlined text-[16px] text-primary">
              check_circle
            </span>
            Không cần xác thực
            <span className="material-symbols-outlined text-[16px] text-primary ml-4">
              check_circle
            </span>
            Dùng thử bản Pro miễn phí 14 ngày
          </div>
        </div>

        {/* Right – mockup image */}
        <div className="relative w-full h-[500px] rounded-xl overflow-hidden shadow-[0_20px_50px_rgba(0,42,113,0.15)] border border-outline-variant/30">
           <Image
            src="/landing_background.jpg" 
            alt="Landing page background"
            fill                         
            className="object-cover"
            priority                     
          />

          {/* UI overlay – call end, mic off, cam, presenter */}
          <div className="absolute bottom-4 left-4 right-4 bg-surface/90 backdrop-blur-md rounded-lg p-2 flex justify-center gap-2 shadow-lg border border-outline-variant/20">
            <button className="flex h-10 w-10 items-center justify-center rounded-full bg-error text-on-error">
              <span className="material-symbols-outlined">call_end</span>
            </button>
            <button className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-container-high text-on-surface">
              <span className="material-symbols-outlined">mic_off</span>
            </button>
            <button className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-container-high text-on-surface">
              <span className="material-symbols-outlined">videocam</span>
            </button>
            <button className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-container text-on-primary-container">
              <span className="material-symbols-outlined">present_to_all</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}