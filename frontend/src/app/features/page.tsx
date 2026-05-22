"use client";

import Link from 'next/link';
import { motion, useScroll, useTransform, type Variants } from 'framer-motion';
import { useRef } from 'react';
import TopNav from '@/components/layout/TopNav';
import Footer from '@/components/layout/Footer';

export default function FeaturesPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  const heroY = useTransform(scrollYProgress, [0, 0.2], [0, -40]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0.15]);

  const fadeUp: Variants = {
    hidden: { opacity: 0, y: 42 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.75, ease: 'easeOut' },
    },
  };

  return (
    <div ref={containerRef} className="min-h-screen bg-background text-on-background flex flex-col">
      <TopNav />
      <main className="overflow-hidden pb-24 flex-grow">
        <motion.section
          style={{ y: heroY, opacity: heroOpacity }}
          className="relative px-6 pt-16 pb-12 lg:px-12 max-w-7xl mx-auto text-center"
        >
          <div className="absolute left-1/2 top-1/2 -z-10 h-[760px] w-[760px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/5 blur-[110px]" />

          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="font-display text-display tracking-tight mb-5"
          >
            Khám phá sức mạnh của{' '}
            <span className="text-primary relative inline-block">
              ViMeet
              <svg
                className="absolute -bottom-2 left-0 h-3 w-full text-primary-fixed-dim"
                viewBox="0 0 100 20"
                preserveAspectRatio="none"
              >
                <path d="M0,10 Q50,0 100,10" fill="none" stroke="currentColor" strokeWidth="8" strokeLinecap="round" />
              </svg>
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.12 }}
            className="mx-auto mb-8 max-w-2xl font-body-lg text-body-lg text-on-surface-variant leading-relaxed"
          >
            Nền tảng giao tiếp toàn diện giúp đội nhóm của bạn kết nối, làm việc và sáng tạo hiệu quả hơn, bất kể khoảng cách.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="flex justify-center"
          >
            <Link
              href="/register"
              className="group relative overflow-hidden rounded-xl bg-primary px-8 py-4 font-label-md text-label-md text-on-primary transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/25"
            >
              <span className="relative z-10 inline-flex items-center gap-2">
                Bắt đầu ngay miễn phí
                <span className="material-symbols-outlined text-[20px] transition-transform group-hover:translate-x-1">
                  arrow_forward
                </span>
              </span>
              <span className="absolute inset-0 translate-y-full bg-white/20 transition-transform duration-300 group-hover:translate-y-0" />
            </Link>
          </motion.div>
        </motion.section>

        <div className="mx-auto flex max-w-7xl flex-col gap-28 px-6 lg:px-12">
          <motion.section
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            className="flex flex-col items-center gap-12 md:flex-row lg:gap-20"
          >
            <div className="md:w-1/2">
              <motion.div whileHover={{ scale: 1.04, rotate: 4 }} className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-primary-fixed-dim/30 bg-primary-fixed shadow-sm">
                <span className="material-symbols-outlined icon-fill text-3xl text-primary">workspaces</span>
              </motion.div>
              <h3 className="mb-4 font-headline-lg text-headline-lg">Tạo và tham gia workspace dễ dàng</h3>
              <p className="font-body-lg text-body-lg text-on-surface-variant leading-relaxed">
                Tổ chức không gian làm việc chuyên nghiệp cho từng dự án hoặc phòng ban. Mời thành viên mới và quản lý quyền truy cập nhanh chóng, giúp đội nhóm bắt đầu ngay lập tức.
              </p>
            </div>

            <div className="h-80 w-full overflow-hidden rounded-[2rem] border border-outline-variant/20 bg-surface-container shadow-2xl shadow-black/5 md:w-1/2 lg:h-[440px]">
              <motion.img
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                alt="Team collaborating"
                className="h-full w-full object-cover opacity-90"
                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2070&auto=format&fit=crop"
              />
            </div>
          </motion.section>

          <motion.section
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            className="flex flex-col items-center gap-12 md:flex-row-reverse lg:gap-20"
          >
            <div className="md:w-1/2">
              <motion.div whileHover={{ scale: 1.04, rotate: -4 }} className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-secondary-fixed-dim/30 bg-secondary-fixed shadow-sm">
                <span className="material-symbols-outlined icon-fill text-3xl text-primary">lock</span>
              </motion.div>
              <h3 className="mb-4 font-headline-lg text-headline-lg">Kênh riêng tư cho từng nhóm</h3>
              <p className="font-body-lg text-body-lg text-on-surface-variant leading-relaxed">
                Đảm bảo tính bảo mật với các kênh trao đổi nội bộ chỉ dành cho thành viên được cấp quyền. Trao đổi chiến lược và tài liệu nhạy cảm an toàn.
              </p>
            </div>

            <div className="relative flex h-[480px] w-full items-center justify-center overflow-hidden rounded-[2rem] border border-outline-variant/20 bg-secondary-container/30 shadow-2xl shadow-black/5 md:w-1/2 lg:h-[480px]">
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="w-11/12 max-w-sm rounded-2xl border border-outline-variant/30 bg-surface/95 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.08)] backdrop-blur lg:p-7"
              >
                <div className="mb-6 flex flex-col items-center border-b border-outline-variant/30 pb-5 text-center">
                  <span className="material-symbols-outlined mb-2 rounded-xl bg-primary/10 p-3 text-3xl text-primary">mail</span>
                  <div className="font-headline-sm text-lg font-bold">Mời tham gia Kênh</div>
                  <div className="text-xs text-on-surface-variant mt-1">Tham gia cùng đội ngũ để thảo luận</div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-secondary">groups</span>
                    <div className="text-sm font-medium"># chien-luoc-kinh-doanh</div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-secondary">link</span>
                    <div className="flex-1 rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-2 text-xs font-mono text-on-surface-variant truncate">
                      vimeet.com/join/clkd-2024
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex gap-3">
                  <button className="flex-1 rounded-lg border border-outline-variant bg-surface-container-lowest py-2 text-sm font-semibold transition-colors hover:bg-surface-variant">Huỷ</button>
                  <button className="flex-1 rounded-lg bg-primary py-2 text-sm font-semibold text-on-primary transition-colors hover:bg-primary/90">Tham gia</button>
                </div>
              </motion.div>
            </div>
          </motion.section>

          <motion.section
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            className="flex flex-col items-center gap-12 md:flex-row lg:gap-20"
          >
            <div className="md:w-1/2">
              <motion.div whileHover={{ scale: 1.04 }} className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-primary-fixed-dim/30 bg-primary-fixed shadow-sm">
                <span className="material-symbols-outlined icon-fill text-3xl text-primary">cloud</span>
              </motion.div>
              <h3 className="mb-4 font-headline-lg text-headline-lg">Lưu trữ lên đến 20GB</h3>
              <p className="font-body-lg text-body-lg text-on-surface-variant leading-relaxed">
                Mỗi workspace có dung lượng đám mây tốc độ cao. Lưu trữ, tìm kiếm và chia sẻ tài liệu dễ dàng mà không lo giới hạn.
              </p>
            </div>

            <div className="relative flex h-80 w-full items-center justify-center overflow-hidden rounded-[2rem] border border-outline-variant/20 bg-primary-fixed/10 shadow-2xl shadow-black/5 md:w-1/2 lg:h-[440px]">
              <motion.div whileHover={{ scale: 1.08 }} className="z-10 flex h-56 w-56 flex-col items-center justify-center gap-2 rounded-full border border-outline-variant/20 bg-surface shadow-2xl">
                <span className="material-symbols-outlined text-5xl text-primary">cloud_done</span>
                <div className="font-display text-4xl font-bold tracking-tighter">20 GB</div>
                <div className="font-label-sm uppercase tracking-widest text-secondary">Storage</div>
              </motion.div>
            </div>
          </motion.section>

          <motion.section
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            className="flex flex-col items-center gap-12 md:flex-row-reverse lg:gap-20"
          >
            <div className="md:w-1/2">
              <motion.div whileHover={{ scale: 1.04 }} className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-primary-fixed-dim/30 bg-primary-fixed shadow-sm">
                <span className="material-symbols-outlined icon-fill text-3xl text-primary">robot_2</span>
              </motion.div>
              <h3 className="mb-4 font-headline-lg text-headline-lg">Tóm tắt trò chuyện Meeting bằng AI</h3>
              <p className="font-body-lg text-body-lg text-on-surface-variant leading-relaxed">
                AI tập trung vào tóm tắt nội dung cuộc họp: ý chính, quyết định và đầu việc trong cuộc trò chuyện Meeting. Không lan sang nội dung khác.
              </p>
            </div>

            <div className="relative flex h-80 w-full items-center justify-center overflow-hidden rounded-[2rem] border border-outline-variant/20 bg-surface-container-highest/30 shadow-2xl shadow-black/5 md:w-1/2 lg:h-[440px]">
              <div className="z-10 flex h-4/5 w-4/5 flex-col overflow-hidden rounded-2xl border border-outline-variant/30 bg-surface/90 shadow-2xl backdrop-blur">
                <div className="flex items-center gap-2 border-b border-outline-variant/30 bg-surface-variant/50 px-5 py-3">
                  <span className="material-symbols-outlined text-sm text-primary">robot_2</span>
                  <span className="font-label-sm font-bold uppercase tracking-wider">AI Meeting Summary</span>
                </div>
                <div className="flex flex-col gap-3 p-5 text-sm text-on-surface-variant">
                  <div className="font-semibold text-primary">Meeting: Product Sync Q3</div>
                  <div>- Quyết định ưu tiên tính năng Workspace Files.</div>
                  <div>- Deadline release bản beta: tuần sau.</div>
                  <div>- Action item: Minh chuẩn bị bản UI final.</div>
                </div>
              </div>
            </div>
          </motion.section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
