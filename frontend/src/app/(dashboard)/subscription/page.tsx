"use client";

import React from 'react';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store/authStore';
import { MaterialSymbol } from '@/components/ui/MaterialSymbol';
import api from '@/services/api';

export default function SubscriptionPage() {
  const { user, setUser } = useAuthStore();
  const [isUpgrading, setIsUpgrading] = React.useState(false);

  const handleUpgrade = async () => {
    if (!user) {
      toast.error('Vui lòng đăng nhập lại để tiếp tục.');
      return;
    }

    setIsUpgrading(true);
    try {
      const res = await api.post('/users/subscription/pro-trial');
      const data = res.data?.data;

      setUser({
        ...user,
        plan: data?.plan ?? 'pro',
        subscriptionPlan: data?.subscriptionPlan ?? 'pro',
        subscriptionExpireTime: data?.subscriptionExpireTime,
      });

      toast.success('Đã kích hoạt gói Pro dùng thử 1 ngày.');
    } catch (err) {
      console.error('Upgrade failed', err);
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(typeof message === 'string' ? message : 'Nâng cấp thất bại, vui lòng thử lại.');
    } finally {
      setIsUpgrading(false);
    }
  };

  return (
    <main className="flex-1 ml-0 md:ml-sidebar_width p-md md:p-xl flex flex-col items-center justify-center min-h-screen bg-background">
      {/* Upgrade Header */}
      <div className="text-center mb-xl max-w-2xl">
        <h1 className="font-display text-display text-primary mb-sm">Nâng cấp lên Pro</h1>
        <p className="font-body-lg text-body-lg text-on-surface-variant">
          Mở khóa toàn bộ tiềm năng của cuộc họp với các tính năng AI nâng cao, lưu trữ không giới hạn và hỗ trợ đặc biệt.
        </p>
      </div>

      {/* Pricing Cards Container */}
      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-lg relative">
        {/* Decorative background element */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-xl blur-3xl -z-10"></div>

        {/* Free Plan Card */}
        <div className="bg-surface rounded-xl p-lg border border-surface-variant flex flex-col opacity-80 transition-opacity hover:opacity-100">
          <div className="mb-lg border-b border-surface-variant pb-md">
            <h3 className="font-headline-md text-headline-md text-on-surface mb-xs">Miễn phí</h3>
            <p className="font-body-md text-body-md text-on-surface-variant mb-md">Dành cho cá nhân và cộng tác cơ bản</p>
            <div className="flex items-baseline gap-xs">
              <span className="font-display text-display text-on-surface">0đ</span>
              <span className="font-body-sm text-body-sm text-on-surface-variant">/tháng</span>
            </div>
          </div>
          <ul className="flex-1 flex flex-col gap-md mb-xl">
            <li className="flex items-start gap-sm">
              <MaterialSymbol icon="check_circle" className="text-outline-variant text-[20px] fill" />
              <span className="font-body-md text-body-md text-on-surface">Tính năng cơ bản</span>
            </li>
            <li className="flex items-start gap-sm">
              <MaterialSymbol icon="check_circle" className="text-outline-variant text-[20px] fill" />
              <span className="font-body-md text-body-md text-on-surface">Tối đa 50 thành viên / Workspace</span>
            </li>
            <li className="flex items-start gap-sm">
              <MaterialSymbol icon="check_circle" className="text-outline-variant text-[20px] fill" />
              <span className="font-body-md text-body-md text-on-surface">2GB lưu trữ / Workspace</span>
            </li>
            <li className="flex items-start gap-sm">
              <MaterialSymbol icon="check_circle" className="text-outline-variant text-[20px] fill" />
              <span className="font-body-md text-body-md text-on-surface">Hỗ trợ tiêu chuẩn</span>
            </li>
          </ul>
          <button className="w-full py-md rounded-lg bg-surface-container border border-outline-variant text-on-surface font-label-md text-label-md hover:bg-surface-container-high transition-colors">
            Gói hiện tại
          </button>
        </div>

        {/* Pro Plan Card */}
        <div className="bg-surface rounded-xl p-lg border-2 border-primary shadow-[0_8px_30px_rgba(37,99,235,0.12)] flex flex-col relative transform md:-translate-y-4">
          {/* Popular Badge */}
          <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-primary text-on-primary px-md py-xs rounded-full font-label-sm text-label-sm uppercase tracking-wider shadow-sm">
            Phổ biến nhất
          </div>
          <div className="mb-lg border-b border-surface-variant pb-md">
            <h3 className="font-headline-md text-headline-md text-primary mb-xs">Gói Pro</h3>
            <p className="font-body-md text-body-md text-on-surface-variant mb-md">Dành cho đội ngũ chuyên nghiệp & người dùng nâng cao</p>
            <div className="flex flex-col">
              <div className="flex items-baseline gap-xs">
                <span className="font-display text-display text-on-surface">220,000đ</span>
                <span className="font-body-sm text-body-sm text-on-surface-variant">/tháng</span>
              </div>
              <span className="font-body-sm text-body-sm text-primary/70">Đã bao gồm 10% thuế VAT</span>
            </div>
          </div>
          <ul className="flex-1 flex flex-col gap-md mb-xl">
            <li className="flex items-start gap-sm">
              <MaterialSymbol icon="check_circle" className="text-primary text-[20px] fill" />
              <span className="font-body-md text-body-md text-on-surface font-medium">Tóm tắt cuộc họp bằng AI <span className="text-on-surface-variant text-sm font-normal ml-1">(AI-powered summaries)</span></span>
            </li>
            <li className="flex items-start gap-sm">
              <MaterialSymbol icon="check_circle" className="text-primary text-[20px] fill" />
              <span className="font-body-md text-body-md text-on-surface">Thời lượng họp không giới hạn <span className="text-on-surface-variant text-sm ml-1 block">Họp thoải mái không lo ngắt quãng</span></span>
            </li>
            <li className="flex items-start gap-sm">
              <MaterialSymbol icon="check_circle" className="text-primary text-[20px] fill" />
              <span className="font-body-md text-body-md text-on-surface">Tối đa 500 thành viên / Workspace <span className="text-on-surface-variant text-sm ml-1 block">Hỗ trợ đội ngũ quy mô lớn</span></span>
            </li>
            <li className="flex items-start gap-sm">
              <MaterialSymbol icon="check_circle" className="text-primary text-[20px] fill" />
              <span className="font-body-md text-body-md text-on-surface">200GB lưu trữ / Workspace <span className="text-on-surface-variant text-sm ml-1 block">Lưu trữ thoải mái bản ghi và tệp</span></span>
            </li>
            <li className="flex items-start gap-sm">
              <MaterialSymbol icon="check_circle" className="text-primary text-[20px] fill" />
              <span className="font-body-md text-body-md text-on-surface">Hỗ trợ ưu tiên <span className="text-on-surface-variant text-sm ml-1 block">Giải đáp thắc mắc nhanh chóng nhất</span></span>
            </li>
          </ul>
          <button
            onClick={handleUpgrade}
            disabled={isUpgrading}
            className="w-full py-md rounded-lg bg-primary text-on-primary font-headline-sm text-headline-sm hover:bg-primary/90 hover:shadow-lg transition-all flex items-center justify-center gap-sm disabled:opacity-60"
          >
            {isUpgrading ? 'Đang xác nhận...' : 'Xác nhận dùng gói Pro 1 ngày'}
            <MaterialSymbol icon="arrow_forward" className="text-[20px]" />
          </button>
          <p className="text-center mt-sm font-body-sm text-body-sm text-on-surface-variant">Thanh toán hàng tháng. Hủy bất cứ lúc nào.</p>
        </div>
      </div>

      {/* Trust Indicators / Footer */}
      <div className="mt-xl flex flex-col items-center gap-md opacity-70">
        <div className="flex gap-lg">
          <div className="flex items-center gap-xs font-label-sm text-label-sm text-on-surface-variant">
            <MaterialSymbol icon="lock" className="text-[16px]" />
            Thanh toán bảo mật
          </div>
          <div className="flex items-center gap-xs font-label-sm text-label-sm text-on-surface-variant">
            <MaterialSymbol icon="support_agent" className="text-[16px]" />
            Hỗ trợ 24/7
          </div>
        </div>
      </div>
    </main>
  );
}
