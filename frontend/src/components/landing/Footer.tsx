import React from 'react';

export default function Footer() {
  return (
    <footer className="bg-surface-container-low border-t border-outline-variant py-xl px-xl">
      <div className="max-w-full mx-auto grid grid-cols-2 md:grid-cols-4 gap-lg mb-xl">
        <div className="col-span-2 md:col-span-1 flex flex-col gap-sm">
          <div className="font-headline-md text-headline-md font-bold text-primary mb-sm">
            ViMeet
          </div>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Biến cuộc trò chuyện thành hành động với ViMeet
          </p>
        </div>
        <div className="flex flex-col gap-sm">
          <h4 className="font-label-md text-label-md text-on-surface font-bold">Sản phẩm</h4>
          <a className="font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors" href="#">Tính năng</a>
          <a className="font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors" href="#">Bảng giá</a>
        </div>
        <div className="flex flex-col gap-sm">
          <h4 className="font-label-md text-label-md text-on-surface font-bold">Tài nguyên</h4>
          <a className="font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors" href="#">Trung tâm trợ giúp</a>
          <a className="font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors" href="#">Tài liệu API</a>
          <a className="font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors" href="#">Community</a>
        </div>
        <div className="flex flex-col gap-sm">
          <h4 className="font-label-md text-label-md text-on-surface font-bold">Về ViMeet</h4>
          <a className="font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors" href="#">Về chúng tôi</a>
          <a className="font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors" href="#">Liên hệ</a>
        </div>
      </div>
      <div className="max-w-full mx-auto border-t border-outline-variant pt-lg flex flex-col md:flex-row justify-between items-center gap-sm">
        <p className="font-body-sm text-body-sm text-outline">© 2026 ViMeet Inc. All rights reserved.</p>
        <div className="flex gap-md font-body-sm text-body-sm text-outline">
          <a className="hover:text-primary transition-colors" href="#">Chính sách bảo mật</a>
          <a className="hover:text-primary transition-colors" href="#">Điều khoản dịch vụ</a>
        </div>
      </div>
    </footer>
  );
}
