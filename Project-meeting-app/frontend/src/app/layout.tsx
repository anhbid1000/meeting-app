import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from 'react-hot-toast';

export const metadata: Metadata = {
  title: 'Meeting App - Họp Trực Tuyến',
  description: 'Nền tảng họp trực tuyến với chat, video và whiteboard',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body className="antialiased bg-slate-50">
        {children}
        <Toaster position="top-center" />
      </body>
    </html>
  );
}
