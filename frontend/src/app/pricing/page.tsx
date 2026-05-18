"use client";

import TopNav from "@/components/layout/TopNav";
import Footer from "@/components/landing/Footer";
import Link from "next/link";
import { JSX } from "react/jsx-dev-runtime";

export default function PricingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-on-surface antialiased">
      <TopNav />
      
      <main className="flex-grow flex flex-col items-center pb-xl">
        {/* Hero Section */}
        <section className="w-full max-w-4xl mx-auto text-center mt-[64px] mb-[48px] px-md">
          <h1 className="font-display text-display text-on-surface mb-md tracking-tight">
            Các gói dịch vụ
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mx-auto">
            Chọn gói dịch vụ phù hợp với nhu cầu của bạn - từ các tính năng cơ bản miễn phí đến các giải pháp nâng cao dành cho các nhóm chuyên nghiệp. Tất cả đều được thiết kế để giúp bạn cộng tác hiệu quả và làm việc thông minh hơn.  
          </p>
        </section>

        {/* Pricing Cards Section */}
        <section className="w-full max-w-5xl mx-auto px-md md:px-lg mb-xl relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter items-center">
            
            {/* Free Plan Card */}
            <div className="bg-surface border border-outline-variant rounded-[24px] p-[40px] shadow-sm flex flex-col h-full hover:shadow-md transition-shadow duration-300">
              <div className="mb-lg">
                <h2 className="font-headline-lg text-headline-lg text-on-surface mb-sm">Gói Miễn Phí</h2>
                <p className="font-body-md text-body-md text-on-surface-variant">
                  Các tính năng cơ bản để bắt đầu cộng tác và tổ chức các cuộc họp hiệu quả mà không tốn phí. Hoàn hảo cho cá nhân và nhóm nhỏ mới bắt đầu.
                </p>
              </div>
              <div className="mb-xl">
                <span className="font-display text-display text-on-surface">0 VND</span>
                <span className="font-body-md text-body-md text-on-surface-variant">/tháng</span>
              </div>
              <button className="w-full py-3 px-4 rounded-lg bg-surface-container border border-outline font-label-md text-label-md text-on-surface hover:bg-surface-variant transition-colors mb-xl">
                <Link href="/register" className="w-full h-full block">
                  Bắt đầu ngay
                </Link>
              </button>
              <div className="flex-grow flex flex-col gap-md">
                <FeatureItem text="Tính năng meeting cơ bản" />
                <FeatureItem text="Giới hạn thời gian 1 giờ mỗi cuộc họp" />
                <FeatureItem text="Kho lưu trữ đám mây tiêu chuẩn (2GB)" />
                <FeatureItem text="Đến 50 người tham gia" />
              </div>
            </div>

            {/* Pro Plan Card */}
            <div className="bg-primary border border-primary rounded-[24px] p-[40px] shadow-[0_20px_40px_-15px_rgba(0,74,198,0.3)] flex flex-col h-full relative overflow-hidden transform md:scale-105 z-10">
              <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
              <div className="mb-lg relative z-10">
                <div className="flex justify-between items-center mb-sm">
                  <h2 className="font-headline-lg text-headline-lg text-on-primary">Gói Pro</h2>
                  <span className="bg-white/20 text-on-primary font-label-sm text-label-sm px-3 py-1 rounded-full border border-white/30 backdrop-blur-sm">Most Popular</span>
                </div>
                <p className="font-body-md text-body-md text-primary-fixed">Các tính năng nâng cao cho các nhóm đang phát triển cần sự cộng tác không giới hạn.</p>
              </div>
              <div className="mb-xl relative z-10">
                <span className="font-display text-display text-on-primary">200,000 VND</span>
                <span className="font-body-md text-body-md text-primary-fixed">/người/tháng</span>
              </div>
              <button className="w-full py-3 px-4 rounded-lg bg-surface text-primary font-label-md text-label-md hover:bg-surface-container-lowest transition-colors shadow-sm mb-xl relative z-10">
                Upgrade to Pro
              </button>
              <div className="flex-grow flex flex-col gap-md relative z-10">
                <FeatureItem text="AI tóm tắt tin nhắn" isPro />
                <FeatureItem text="Thời lượng họp không giới hạn" isPro />
                <FeatureItem text="20GB bộ nhớ đám mây an toàn" isPro />
                <FeatureItem text="Vai trò và kiểm duyệt người tham gia nâng cao" isPro />
                <FeatureItem text="Đến 500 người tham gia" isPro />
              </div>
            </div>

          </div>
        </section>

        {/* Comparison Table */}
        <section className="w-full max-w-5xl mx-auto px-md md:px-lg mt-xl">
          <h3 className="font-headline-md text-headline-md text-on-surface mb-lg text-center">So sánh các gói dịch vụ</h3>
          <div className="bg-surface rounded-[16px] border border-outline-variant shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low border-b border-outline-variant">
                  <th className="py-lg px-lg font-headline-sm text-headline-sm text-on-surface font-semibold w-1/3">Tính năng</th>
                  <th className="py-lg px-lg font-headline-sm text-headline-sm text-on-surface font-semibold w-1/3">Gói Miễn Phí</th>
                  <th className="py-lg px-lg font-headline-sm text-headline-sm text-primary font-semibold w-1/3">Gói Pro</th>
                </tr>
              </thead>
              <tbody className="font-body-md text-body-md">
                <TableRow label="Số lượng người tham dự tối đa" free="50" pro="500" />
                <TableRow label="Giới hạn thời lượng họp" free="1 Giờ" pro="Không giới hạn" />
                <TableRow label="Kho lưu trữ bản ghi đám mây" free="2 GB" pro="20 GB" />
                <TableRow label="AI Tóm tắt thông minh" free={false} pro={true} hasInfo="Tự động tạo biên bản cuộc họp" />
                <TableRow label="Quản lý vai trò nâng cao" free={false} pro={true} />
                <TableRow label="Hỗ trợ ưu tiên 24/7" free={false} pro={true} />
              </tbody>
            </table>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

// Helper Components
function FeatureItem({ text, isPro = false }: { text: string | JSX.Element; isPro?: boolean }) {
  return (
    <div className="flex items-start gap-sm">
      <span className={`material-symbols-outlined ${isPro ? 'text-on-primary' : 'text-secondary'} text-[20px] mt-[2px]`}>
        check_circle
      </span>
      <span className={`font-body-md text-body-md ${isPro ? 'text-on-primary' : 'text-on-surface'}`}>
        {text}
      </span>
    </div>
  );
}

function TableRow({ label, free, pro, hasInfo }: { label: string, free: any, pro: any, hasInfo?: string }) {
  const renderValue = (val: any) => {
    if (typeof val === 'boolean') {
      return val ? (
        <span className="material-symbols-outlined text-primary">check</span>
      ) : (
        <span className="material-symbols-outlined text-outline-variant">remove</span>
      );
    }
    return val;
  };

  return (
    <tr className="border-b border-surface-variant hover:bg-surface-container-lowest transition-colors">
      <td className="py-md px-lg text-on-surface-variant flex items-center gap-2">
        {label}
        {hasInfo && (
          <span className="material-symbols-outlined text-[16px] text-tertiary-container cursor-help" title={hasInfo}>info</span>
        )}
      </td>
      <td className="py-md px-lg text-on-surface">{renderValue(free)}</td>
      <td className="py-md px-lg text-primary font-medium">{renderValue(pro)}</td>
    </tr>
  );
}