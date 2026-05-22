'use client';

interface ChannelPageProps {
  params: Promise<{
    channelId: string;
  }>;
}

export default function ChannelPage(_props: ChannelPageProps) {
  return (
    <main className="flex min-h-screen flex-col bg-[#f8f9fb] p-6 text-[#191c1e]">
      <section className="rounded-xl border border-[#c3c6d7] bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#dbe1ff] text-[#004ac6]">
            <span className="material-symbols-outlined">forum</span>
          </div>
          <div>
            <h1 className="text-xl font-semibold">Channel Chat</h1>
            <p className="text-sm text-[#516070]">
              Trang chi tiết channel đang được giữ placeholder để không chặn
              build. UI chat sẽ được hoàn thiện ở phase riêng.
            </p>
          </div>
        </div>
        <p className="text-sm text-[#516070]">
          Quay lại Channel Directory để test Phase 6.
        </p>
      </section>
    </main>
  );
}
// <!DOCTYPE html><html class="light" lang="en"><head>
// <meta charset="utf-8">
// <meta content="width=device-width, initial-scale=1.0" name="viewport">
// <title>#engineering - ViMeet Pro</title>
// <script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
// <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&amp;display=swap" rel="stylesheet">
// <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet">
// <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet">
// <script id="tailwind-config">
//         tailwind.config = {
//             darkMode: "class",
//             theme: {
//                 extend: {
//                     "colors": {
//                         "on-primary-container": "#eeefff",
//                         "secondary-container": "#d5e4f8",
//                         "background": "#f8f9fb",
//                         "surface-container-low": "#f3f4f6",
//                         "secondary-fixed-dim": "#b9c8db",
//                         "on-tertiary-fixed": "#1a1c1c",
//                         "surface-tint": "#0053db",
//                         "on-secondary-fixed": "#0e1d2b",
//                         "primary-fixed-dim": "#b4c5ff",
//                         "on-secondary-container": "#576676",
//                         "surface-variant": "#e1e2e4",
//                         "inverse-primary": "#b4c5ff",
//                         "on-surface": "#191c1e",
//                         "on-background": "#191c1e",
//                         "error-container": "#ffdad6",
//                         "inverse-on-surface": "#f0f1f3",
//                         "tertiary-fixed-dim": "#c6c6c7",
//                         "tertiary": "#535555",
//                         "surface-container-lowest": "#ffffff",
//                         "on-surface-variant": "#434655",
//                         "on-primary-fixed": "#00174b",
//                         "primary-container": "#2563eb",
//                         "on-tertiary-container": "#f0f0f0",
//                         "surface-container-high": "#e7e8ea",
//                         "secondary": "#516070",
//                         "on-error-container": "#93000a",
//                         "surface-dim": "#d9dadc",
//                         "on-secondary-fixed-variant": "#3a4858",
//                         "surface-container-highest": "#e1e2e4",
//                         "primary-fixed": "#dbe1ff",
//                         "on-tertiary": "#ffffff",
//                         "error": "#ba1a1a",
//                         "on-secondary": "#ffffff",
//                         "tertiary-container": "#6c6d6d",
//                         "outline": "#737686",
//                         "surface": "#f8f9fb",
//                         "on-primary-fixed-variant": "#003ea8",
//                         "on-error": "#ffffff",
//                         "tertiary-fixed": "#e2e2e2",
//                         "secondary-fixed": "#d5e4f8",
//                         "surface-bright": "#f8f9fb",
//                         "outline-variant": "#c3c6d7",
//                         "primary": "#004ac6",
//                         "on-tertiary-fixed-variant": "#454747",
//                         "on-primary": "#ffffff",
//                         "inverse-surface": "#2e3132",
//                         "surface-container": "#edeef0"
//                     },
//                     "borderRadius": {
//                         "DEFAULT": "0.25rem",
//                         "lg": "0.5rem",
//                         "xl": "0.75rem",
//                         "full": "9999px"
//                     },
//                     "spacing": {
//                         "xl": "32px",
//                         "sm": "8px",
//                         "md": "16px",
//                         "lg": "24px",
//                         "gutter": "24px",
//                         "xs": "4px",
//                         "sidebar_width": "280px",
//                         "base": "4px"
//                     },
//                     "fontFamily": {
//                         "headline-sm": ["Inter"],
//                         "headline-lg": ["Inter"],
//                         "display": ["Inter"],
//                         "body-md": ["Inter"],
//                         "headline-md": ["Inter"],
//                         "label-sm": ["Inter"],
//                         "body-sm": ["Inter"],
//                         "body-lg": ["Inter"],
//                         "label-md": ["Inter"]
//                     }
//                 }
//             }
//         }
//     </script>
// <style>
//         .material-symbols-outlined {
//             font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
//             vertical-align: middle;
//         }
//         .chat-scrollbar::-webkit-scrollbar {
//             width: 6px;
//         }
//         .chat-scrollbar::-webkit-scrollbar-track {
//             background: transparent;
//         }
//         .chat-scrollbar::-webkit-scrollbar-thumb {
//             background: #e1e2e4;
//             border-radius: 10px;
//         }
//         .message-hover-actions {
//             opacity: 0;
//             transition: opacity 0.1s ease-in-out;
//         }
//         .message-group:hover .message-hover-actions {
//             opacity: 1;
//         }
//         .glass-panel {
//             background: rgba(255, 255, 255, 0.8);
//             backdrop-filter: blur(12px);
//         }
//     </style>
// </head>
// <body class="bg-background font-body-md text-on-surface h-screen overflow-hidden flex">
// <!-- Sidebar Navigation (SideNavBar Anchor) -->
// <aside class="w-sidebar_width h-screen sticky left-0 top-0 bg-surface-container-low border-r border-surface-variant flex flex-col py-lg shrink-0">
// <div class="px-md mb-lg">
// <div class="flex items-center gap-sm">
// <div class="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-on-primary font-bold">V</div>
// <div>
// <h1 class="font-headline-sm text-headline-sm text-primary leading-none">ViMeet Pro</h1>
// <p class="text-label-sm font-label-sm text-secondary">Enterprise Space</p>
// </div>
// </div>
// </div>
// <nav class="flex-1 px-sm space-y-1">
// <div class="flex items-center gap-md px-md py-sm text-secondary hover:bg-surface-variant rounded-lg cursor-pointer transition-all">
// <span class="material-symbols-outlined">dashboard</span>
// <span class="font-label-md text-label-md">Dashboard</span>
// </div>
// <div class="flex items-center gap-md px-md py-sm text-secondary hover:bg-surface-variant rounded-lg cursor-pointer transition-all">
// <span class="material-symbols-outlined">video_chat</span>
// <span class="font-label-md text-label-md">Meetings</span>
// </div>
// <div class="flex items-center gap-md px-md py-sm text-secondary hover:bg-surface-variant rounded-lg cursor-pointer transition-all">
// <span class="material-symbols-outlined">group</span>
// <span class="font-label-md text-label-md">Groups</span>
// </div>
// <!-- Active State: Channels -->
// <div class="flex items-center gap-md px-md py-sm bg-secondary-container text-primary border-l-4 border-primary rounded-r-lg cursor-pointer transition-all">
// <span class="material-symbols-outlined">forum</span>
// <span class="font-label-md text-label-md">Channels</span>
// </div>
// <!-- Channel Sublist -->
// <div class="pl-xl mt-sm space-y-1">
// <div class="flex items-center justify-between px-md py-1.5 text-secondary hover:bg-surface-variant rounded-lg cursor-pointer group">
// <span class="font-label-md text-label-md"># general</span>
// </div>
// <div class="flex items-center justify-between px-md py-1.5 bg-surface-variant text-on-surface font-semibold rounded-lg cursor-pointer group">
// <span class="font-label-md text-label-md"># engineering</span>
// <span class="w-2 h-2 bg-primary rounded-full"></span>
// </div>
// <div class="flex items-center justify-between px-md py-1.5 text-secondary hover:bg-surface-variant rounded-lg cursor-pointer group">
// <span class="font-label-md text-label-md"># design-ops</span>
// </div>
// </div>
('use client');

// <div class="flex items-center gap-md px-md py-sm text-secondary hover:bg-surface-variant rounded-lg cursor-pointer transition-all">
// <span class="material-symbols-outlined">history</span>
// <span class="font-label-md text-label-md">History</span>
// </div>
// <div class="flex items-center gap-md px-md py-sm text-secondary hover:bg-surface-variant rounded-lg cursor-pointer transition-all">
// <span class="material-symbols-outlined">folder_open</span>
// <span class="font-label-md text-label-md">Files</span>
// </div>
// </nav>
// <div class="mt-auto px-md">
// <button class="w-full py-md bg-primary text-on-primary rounded-xl font-label-md text-label-md flex items-center justify-center gap-sm active:scale-95 transition-transform shadow-md">
// <span class="material-symbols-outlined">add_circle</span>
//                 Start Meeting
//             </button>
// </div>
// </aside>
// <!-- Main Content Area -->
// <main class="flex-1 flex flex-col min-w-0 bg-surface">
// <!-- Channel Header -->
// <header class="h-16 flex items-center justify-between px-lg bg-surface-container-lowest border-b border-surface-variant sticky top-0 z-10">
// <div class="flex items-center gap-md">
// <div>
// <div class="flex items-center gap-xs">
// <span class="font-headline-sm text-headline-sm font-bold text-on-surface"># engineering</span>
// <span class="material-symbols-outlined text-secondary text-sm">lock</span>
// </div>
// <p class="text-label-sm font-label-sm text-secondary truncate max-w-[300px]">Backend architecture and infrastructure scaling discussions.</p>
// </div>
// <div class="h-8 w-[1px] bg-surface-variant mx-sm"></div>
// <div class="flex -space-x-2">
// <img class="w-8 h-8 rounded-full border-2 border-surface-container-lowest" data-alt="Close-up portrait of a young professional male software engineer with a friendly expression in a brightly lit modern office environment, shallow depth of field, corporate blue color palette." src="https://lh3.googleusercontent.com/aida-public/AB6AXuCpFCSpp_4a9f12axjWd23u7TWmaPWFlBglypZdsqeHfq8ISo9qMjwsPl-FzlnJ_3N5jGuViNzP8Btj5qOXnrc_AKs9eHpyPmWNXQ-5M80eCpn3_s6LSt32gL3ZtyX1dvyEKHUxO9D4IaCheTygxzUiLySEoG_a-hezRFY5I4hU55TOou7X6kH-RCi8_WLI_UKB1UEnYa7oAWL00l3pypuuzle-dqRod4TMfSxUZKVZXwVDH8P1no4WvKvvRiIM_7Iw9QTm51zBDJzs">
// <img class="w-8 h-8 rounded-full border-2 border-surface-container-lowest" data-alt="Professional headshot of a female tech lead with a warm smile, wearing modern glasses, set against a clean minimalist studio background with soft warm lighting and professional cool-tone accents." src="https://lh3.googleusercontent.com/aida-public/AB6AXuDDjtbQ3_5fR5lhGMn4ugOtFbbCh7fMhTcKaJ5wuSKxjttP5BfbIrVjD5-nn46WUgqCOgqA8ZLS0bT8wjw-JlRSEcmwO5Ik0RvbHuyPIVsQ9nbE5cQ9tWB687vnH31WYxJ2H1zqubh-GXpwyRX4SWNDk3mLr982pvktljS8WAJJhJGaMr1LyuMMIWHzRtnjujSEo6u0A9wQQk3NLa3SmpRAwW7ast944lMKfuY7RQs9Le3bcSgzOvKcW_xpgit4w3cZfjW7K7K00v2y">
// <div class="w-8 h-8 rounded-full bg-surface-container-high border-2 border-surface-container-lowest flex items-center justify-center text-label-sm font-bold text-secondary">+12</div>
// </div>
// </div>
// <div class="flex items-center gap-sm">
// <button class="p-sm text-secondary hover:bg-surface-container-high rounded-full transition-colors">
// <span class="material-symbols-outlined">search</span>
// </button>
// <button class="p-sm text-secondary hover:bg-surface-container-high rounded-full transition-colors">
// <span class="material-symbols-outlined">call</span>
// </button>
// <button class="px-md py-sm bg-primary text-on-primary rounded-lg font-label-md text-label-md flex items-center gap-xs hover:bg-on-primary-fixed-variant transition-colors shadow-sm">
// <span class="material-symbols-outlined" style="font-variation-settings: &quot;FILL&quot; 1;">videocam</span>
//                     Join Meeting
//                 </button>
// <button class="p-sm text-secondary hover:bg-surface-container-high rounded-full transition-colors">
// <span class="material-symbols-outlined">settings</span>
// </button>
// </div>
// </header>
// <!-- Meeting Banner -->
// <div class="mx-lg mt-md p-md bg-primary-container text-on-primary-container rounded-xl flex items-center justify-between shadow-sm border border-primary/20 animate-pulse-subtle">
// <div class="flex items-center gap-md">
// <div class="w-10 h-10 bg-on-primary-container/20 rounded-full flex items-center justify-center">
// <span class="material-symbols-outlined text-on-primary-container">podcasts</span>
// </div>
// <div>
// <p class="font-label-md text-label-md font-bold">Meeting in Progress: Sprint Planning</p>
// <p class="text-body-sm">4 participants are currently in the room.</p>
// </div>
// </div>
// <div class="flex gap-sm">
// <button class="px-md py-sm bg-on-primary-container text-primary font-bold rounded-lg text-label-md hover:bg-white transition-colors">Join Now</button>
// <button class="p-sm text-on-primary-container/80 hover:bg-on-primary-container/10 rounded-lg"><span class="material-symbols-outlined">close</span></button>
// </div>
// </div>
// <!-- Chat Area -->
// <div class="flex-1 overflow-y-auto chat-scrollbar px-lg py-lg space-y-md">
// <div class="text-center my-lg">
// <div class="h-[1px] bg-surface-variant w-full relative">
// <span class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-md bg-surface text-label-sm font-semibold text-secondary">Tuesday, October 24th</span>
// </div>
// </div>
// <!-- Message Group: Other -->
// <div class="message-group flex gap-md group">
// <img class="w-10 h-10 rounded-xl object-cover shrink-0" data-alt="Portrait of a creative professional male with short beard and stylish glasses, soft daylight hitting from the side, clean modern office background, professional enterprise photography style." src="https://lh3.googleusercontent.com/aida-public/AB6AXuD7DxQ36tuWE0AZXhrMFIFAYPndEuP8CnYCb007UKVGu6pUOkBS5cnY9MWHN_UwlnVgyggRnXbpOnWGnGPboNidlIl3yvEbDin7CzpMAwPCCcpHkXb6J-HsI0uavfTbjNUQdllFsdKqoGu22XfFSg4fEfMLZWY0mixwN5oesVda_LrYtas-1Yc6zQCbr2549nb57rqbZH4cwtNFTgjGQbyqRnMPpGaXjLViMKxx6hD_Xi0xTQeNsAM3RjLGGvtjB4BJVT5Dzy-t0gFa">
// <div class="flex-1 min-w-0">
// <div class="flex items-baseline gap-sm">
// <span class="font-bold text-on-surface">Marcus Chen</span>
// <span class="text-label-sm text-secondary">10:24 AM</span>
// </div>
// <div class="mt-1 space-y-md">
// <p class="text-body-md text-on-surface-variant leading-relaxed">
//                             Hey team, I've pushed the new <code class="px-1.5 py-0.5 bg-surface-container-high rounded font-mono text-sm text-primary">/api/v2/auth</code> endpoint to staging. Can someone from the frontend team verify the JWT handshake?
//                         </p>
// <!-- Mentions & Reactions -->
// <div class="flex flex-wrap gap-sm items-center mt-sm">
// <span class="px-2 py-0.5 bg-secondary-container text-primary rounded-full text-sm font-medium">@frontend-devs</span>
// <div class="flex items-center gap-1 px-2 py-0.5 bg-surface-container-low border border-surface-variant rounded-full text-xs cursor-pointer hover:bg-surface-variant transition-colors">
// <span class="">🚀</span><span class="text-secondary font-bold">4</span>
// </div>
// <div class="flex items-center gap-1 px-2 py-0.5 bg-surface-container-low border border-surface-variant rounded-full text-xs cursor-pointer hover:bg-surface-variant transition-colors">
// <span class="">👀</span><span class="text-secondary font-bold">2</span>
// </div>
// </div>
// </div>
// </div>
// <div class="message-hover-actions flex items-center bg-surface-container-lowest border border-surface-variant rounded-lg shadow-sm h-10 px-sm self-start">
// <button class="p-1 hover:bg-surface-variant rounded transition-colors text-secondary"><span class="material-symbols-outlined text-sm">add_reaction</span></button>
// <button class="p-1 hover:bg-surface-variant rounded transition-colors text-secondary"><span class="material-symbols-outlined text-sm">reply</span></button>
// <button class="p-1 hover:bg-surface-variant rounded transition-colors text-secondary"><span class="material-symbols-outlined text-sm">bookmark</span></button>
// <button class="p-1 hover:bg-surface-variant rounded transition-colors text-secondary"><span class="material-symbols-outlined text-sm">more_horiz</span></button>
// </div>
// </div>
// <!-- Message Group: User (Self) -->
// <div class="message-group flex gap-md group flex-row-reverse">
// <div class="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-on-primary font-bold shrink-0">JD</div>
// <div class="flex-1 min-w-0 text-right">
// <div class="flex items-baseline gap-sm justify-end">
// <span class="text-label-sm text-secondary">10:28 AM</span>
// <span class="font-bold text-on-surface">Jane Doe</span>
// </div>
// <div class="mt-1 flex flex-col items-end">
// <div class="bg-primary-container text-on-primary-container px-md py-sm rounded-2xl rounded-tr-none max-w-lg shadow-sm">
// <p class="text-body-md text-left">On it, Marcus. I'll test the handshake and the new token refresh logic. Are there any specific edge cases we should look for?</p>
// </div>
// <div class="flex items-center gap-1 mt-1">
// <span class="material-symbols-outlined text-[14px] text-primary" style="font-variation-settings: &quot;FILL&quot; 1;">done_all</span>
// <span class="text-[10px] text-secondary font-medium">Seen</span>
// </div>
// </div>
// </div>
// <div class="message-hover-actions flex items-center bg-surface-container-lowest border border-surface-variant rounded-lg shadow-sm h-10 px-sm self-start">
// <button class="p-1 hover:bg-surface-variant rounded transition-colors text-secondary"><span class="material-symbols-outlined text-sm">add_reaction</span></button>
// <button class="p-1 hover:bg-surface-variant rounded transition-colors text-secondary"><span class="material-symbols-outlined text-sm">edit</span></button>
// <button class="p-1 hover:bg-surface-variant rounded transition-colors text-secondary"><span class="material-symbols-outlined text-sm">delete</span></button>
// </div>
// </div>
// <!-- File Upload Preview -->
// <div class="message-group flex gap-md group">
// <img class="w-10 h-10 rounded-xl object-cover shrink-0" data-alt="Portrait of a senior developer with silver hair and a thoughtful expression, high-contrast black and white photography with subtle blue highlights, professional executive aesthetic." src="https://lh3.googleusercontent.com/aida-public/AB6AXuCRIeAJQANIWUbp8DSztkiSk-h_qhq6Xk2bctpd7pMO-ZkKy-UWVpqrOkQkM5PG2d4JnAQ5iceHLiY7VNSvPAg-NLRTcd43qdt5cO8KiFW4tEYnjsMv7eWBTXXZpWjJOv_Bi_LuBGGpzDld90DRMHfR6hYrtziLRuLPSFA0gVZKwRFqmiTbFepRNBOv28vNbQLpd_Y3yQAIfzR2KxX51B7p8E0B0qSBr0hD5a7my2HJkJZbaF8CXI6K2lN2wzmqwT9jlhgYSXkfNM05">
// <div class="flex-1 min-w-0">
// <div class="flex items-baseline gap-sm">
// <span class="font-bold text-on-surface">Alex Rivera</span>
// <span class="text-label-sm text-secondary">10:35 AM</span>
// </div>
// <div class="mt-md max-w-md bg-surface-container-lowest border border-surface-variant rounded-xl overflow-hidden shadow-sm hover:border-primary/40 cursor-pointer transition-all">
// <div class="h-32 bg-surface-container-high flex items-center justify-center relative">
// <span class="material-symbols-outlined text-4xl text-secondary">analytics</span>
// <div class="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
// </div>
// <div class="p-md flex items-center justify-between">
// <div class="flex items-center gap-md">
// <div class="w-10 h-10 bg-error-container rounded flex items-center justify-center text-error">
// <span class="material-symbols-outlined">description</span>
// </div>
// <div>
// <p class="font-bold text-on-surface truncate">Load_Balancer_Architecture.pdf</p>
// <p class="text-label-sm text-secondary">4.2 MB • PDF Document</p>
// </div>
// </div>
// <span class="material-symbols-outlined text-secondary">download</span>
// </div>
// </div>
// </div>
// </div>
// <!-- Thread Indicator -->
// <div class="ml-[56px] border-l-4 border-surface-variant pl-md py-sm flex items-center gap-sm cursor-pointer hover:bg-surface-container-low transition-colors rounded-r-lg group">
// <div class="flex -space-x-1.5">
// <img class="w-6 h-6 rounded-full border border-surface" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBd-yXaV6kMjkSNx8UIpMrVjFGEyjEzoeqnnOFdewzCjizAidxCwWaXQIqj_n7gsgOqQx6SjInhWUJ2SJ9bwHgnSx9_lzLaOUOU8zA1e_NA42njNCvUJZUGbdOHQqoxUIdzExO4yo04FDQAN5lAWuIglhRmYTj5q88Wf7zTxMTYTbvF-mlqXhQQIEx02vL93zoXhI8gQg_-4fAYjesBTsg--gdgBFlngkoH5a7b-vWQzxYxZz3gU9PUKxq-B7oU2gK2sDkW8k9jid05">
// <img class="w-6 h-6 rounded-full border border-surface" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBh6IiBCgkYwizuFi4eEOqXGSQjYf3f8AyVoVcutD17of7TdiTZgSh7FDzHgGY0aywl20YVg9ZPwW0fAhRtDP3109swDNZhz2R_WTaCuK326D1WjsiB-qVaX4lyOLtxAUAg8v_dbRkJT3cwVXWMpiESzrCVAsl5KZNIvzcGz3HJzDqwmFfNYlLFb7Y58sLaFcn66dfWMU7J8gnQz2dMxa6b2Jh3yk42OWrs3-x54fBqKg5toAvS6JwdpNmsALoqdRKogIqcUl7pc1mS">
// </div>
// <span class="text-label-md font-bold text-primary group-hover:underline">3 replies</span>
// <span class="text-label-sm text-secondary">Last reply 12 mins ago</span>
// </div>
// </div>
// <!-- Realtime Indicators -->
// <div class="px-lg pb-sm flex items-center gap-sm">
// <div class="flex gap-1">
// <span class="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style="animation-delay: 0s"></span>
// <span class="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style="animation-delay: 0.2s"></span>
// <span class="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style="animation-delay: 0.4s"></span>
// </div>
// <p class="text-label-sm text-secondary italic font-medium">Alex Rivera is typing...</p>
// </div>
// <!-- Chat Composer -->
// <footer class="px-lg pb-lg">
// <div class="bg-surface-container-lowest border border-surface-variant rounded-2xl shadow-lg focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10 transition-all overflow-hidden">
// <div class="flex items-center gap-1 p-sm border-b border-surface-variant bg-surface-container-low/50">
// <button class="p-1.5 hover:bg-surface-variant rounded text-secondary" title="Bold"><span class="material-symbols-outlined text-md">format_bold</span></button>
// <button class="p-1.5 hover:bg-surface-variant rounded text-secondary" title="Italic"><span class="material-symbols-outlined text-md">format_italic</span></button>
// <button class="p-1.5 hover:bg-surface-variant rounded text-secondary" title="Strikethrough"><span class="material-symbols-outlined text-md">format_strikethrough</span></button>
// <div class="w-[1px] h-4 bg-surface-variant mx-1"></div>
// <button class="p-1.5 hover:bg-surface-variant rounded text-secondary" title="Link"><span class="material-symbols-outlined text-md">link</span></button>
// <button class="p-1.5 hover:bg-surface-variant rounded text-secondary" title="Code"><span class="material-symbols-outlined text-md">code</span></button>
// <button class="p-1.5 hover:bg-surface-variant rounded text-secondary" title="Bullet List"><span class="material-symbols-outlined text-md">format_list_bulleted</span></button>
// </div>
// <div class="relative">
// <textarea class="w-full bg-transparent border-none focus:ring-0 p-md min-h-[100px] text-body-md placeholder:text-outline/50 resize-none" placeholder="Message #engineering..."></textarea>
// </div>
// <div class="flex items-center justify-between p-sm">
// <div class="flex items-center gap-1">
// <button class="p-2 hover:bg-surface-variant rounded-full text-secondary transition-colors"><span class="material-symbols-outlined">add</span></button>
// <button class="p-2 hover:bg-surface-variant rounded-full text-secondary transition-colors"><span class="material-symbols-outlined">mood</span></button>
// <button class="p-2 hover:bg-surface-variant rounded-full text-secondary transition-colors"><span class="material-symbols-outlined">alternate_email</span></button>
// </div>
// <div class="flex items-center gap-md">
// <span class="text-label-sm text-secondary">Press ⏎ to send</span>
// <button class="w-10 h-10 bg-primary text-on-primary rounded-xl flex items-center justify-center hover:bg-on-primary-fixed-variant shadow-md active:scale-95 transition-all">
// <span class="material-symbols-outlined" style="font-variation-settings: &quot;FILL&quot; 1;">send</span>
// </button>
// </div>
// </div>
// </div>
// </footer>
// </main>
// <!-- Right-side Collaboration Panel -->
// <aside class="w-sidebar_width h-screen sticky right-0 top-0 bg-surface-container-lowest border-l border-surface-variant flex flex-col shrink-0">
// <div class="h-16 flex items-center justify-between px-md border-b border-surface-variant">
// <h2 class="font-headline-sm text-headline-sm text-on-surface">Collaboration</h2>
// <button class="p-1.5 hover:bg-surface-variant rounded text-secondary"><span class="material-symbols-outlined">close</span></button>
// </div>
// <!-- Tabs -->
// <div class="flex px-md border-b border-surface-variant">
// <button class="flex-1 py-md text-label-md font-bold text-primary border-b-2 border-primary">Members</button>
// <button class="flex-1 py-md text-label-md font-medium text-secondary hover:text-on-surface">Files</button>
// <button class="flex-1 py-md text-label-md font-medium text-secondary hover:text-on-surface">Pinned</button>
// </div>
// <div class="flex-1 overflow-y-auto chat-scrollbar p-md space-y-lg">
// <!-- Members List -->
// <section>
// <h3 class="text-label-sm font-bold text-secondary uppercase tracking-wider mb-md px-1">Online — 4</h3>
// <div class="space-y-sm">
// <div class="flex items-center gap-md p-2 hover:bg-surface-container-low rounded-lg cursor-pointer transition-colors group">
// <div class="relative shrink-0">
// <img class="w-10 h-10 rounded-xl" data-alt="Portrait of Marcus Chen." src="https://lh3.googleusercontent.com/aida-public/AB6AXuByNFPvg7Uupj0shMrTNQYOKR2Vk3UMzoYT0rVsfcy6qzYbjcoqLBlewMi_gPxN5fW3Z3UP-f96Iv-eiAq6YZRbTN_yFoC1vnqtU_a-EjaU8MTTCYTVyOygsVji8coi55xSU_hxGZ5Xu_fK16UGWg-BnE3ib6OJVy2hjRAIOKOt-rTpuDWPwsANszzahWF5zt86DMkYD68VhATsRm3fQjxbBuTfiNtxmIEkZaD_2wXVnWaq9A4FpEeXOgbQa9OOeGp4VAcKO5oJoZjD">
// <div class="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-surface-container-lowest rounded-full"></div>
// </div>
// <div class="flex-1 min-w-0">
// <p class="font-label-md text-on-surface truncate">Marcus Chen</p>
// <p class="text-xs text-secondary truncate">Backend Lead</p>
// </div>
// <span class="px-1.5 py-0.5 bg-surface-variant text-[10px] font-bold text-secondary rounded">Admin</span>
// </div>
// <div class="flex items-center gap-md p-2 hover:bg-surface-container-low rounded-lg cursor-pointer transition-colors">
// <div class="relative shrink-0">
// <img class="w-10 h-10 rounded-xl" data-alt="Portrait of Jane Doe." src="https://lh3.googleusercontent.com/aida-public/AB6AXuD9N9mA_inro3BrFBadYqXX0cP5BAF5HHMgQ1Bfv37SvGJQk1sI9ReRU_xoWVNY85Uxv-7DJlCf-GCJJOEqQBx2JvaNg6ndIRWjDCj_yHZyi52e-_rBJ6PLEIfZfboWRXdSHdxobUneeoftIEkARa9nApsbk8_RziVr8KgrrkKB0daZJrJ5DTjg8xTvFKYfs1ZAcLFYs-ferdzFD-G4m-OcJgsiSpqQ4d9pRMXVecFSf13-s6KtmDvh9uQh6HKZxOwc2jKLpBQPpaIs">
// <div class="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-surface-container-lowest rounded-full"></div>
// </div>
// <div class="flex-1 min-w-0">
// <p class="font-label-md text-on-surface truncate">Jane Doe (You)</p>
// <p class="text-xs text-secondary truncate">Senior Product Designer</p>
// </div>
// </div>
// <div class="flex items-center gap-md p-2 hover:bg-surface-container-low rounded-lg cursor-pointer transition-colors">
// <div class="relative shrink-0">
// <img class="w-10 h-10 rounded-xl" data-alt="Portrait of Alex Rivera." src="https://lh3.googleusercontent.com/aida-public/AB6AXuD7-dbyYYzzJMpE9nPJ0WFtPxIyrisofBxWcEbb1vaxedE7x2pYEH1ShWd67tFLxITzmx2zxGEwtN4CMmlSfFW954eEISgEkpQN0rtKOUzE7eviP7nVO6YhkTryMfltDUf8df-Su2InA7JFewhpkp0REsH-Om5568PZSs1edEqQAbbLyI4p9mS5w0l8MfW18-SbbBdjvbhoY-WCePKCL-GIF7fakzw88PPusKkVw7PDB0RCAZkiikbF2CaJoXd-wFyaazg1FEFDS5eH">
// <div class="absolute -bottom-1 -right-1 w-4 h-4 bg-orange-500 border-2 border-surface-container-lowest rounded-full"></div>
// </div>
// <div class="flex-1 min-w-0">
// <p class="font-label-md text-on-surface truncate">Alex Rivera</p>
// <p class="text-xs text-secondary truncate">Away • 15m</p>
// </div>
// </div>
// </div>
// </section>
// <!-- Pinned Section Preview -->
// <section>
// <div class="flex items-center justify-between px-1 mb-md">
// <h3 class="text-label-sm font-bold text-secondary uppercase tracking-wider">Pinned Messages</h3>
// <button class="text-primary text-xs font-bold hover:underline">View All</button>
// </div>
// <div class="p-md bg-secondary-container/30 border border-primary/10 rounded-xl">
// <div class="flex items-center gap-xs mb-sm">
// <span class="material-symbols-outlined text-primary text-sm">push_pin</span>
// <span class="text-[10px] font-bold text-primary uppercase">Important</span>
// </div>
// <p class="text-body-sm text-on-surface-variant line-clamp-3 italic">
//                         "The quarterly API migration is scheduled for next Friday. Please ensure all microservices are updated to v2.3."
//                     </p>
// <div class="mt-md flex items-center gap-sm">
// <img class="w-5 h-5 rounded-full" data-alt="Marcus Chen avatar" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAh3ydUOmmvWm1RDsB2lqLsvaPRa4OFV6m4uxSAUXBZ6tU6-8CVTTBH-TMvtH0YuFAdYs2CB665VlANw2XdVotyjbq40a8S0wbI4kELcxAWUwol0uF_x6vzOrIbjhFSXfTU52A2A-XlNSV3xbWTj7Tsmr14N-nzzh_sNbUeRfvBHnJVW_bOXGque30oYzTVDlZ-TDCHsebeHGzJGRrMdYaLa3M140sBysEHaWoIYh6R7Rk3kBv_-O-_rYxnQsVNyl2H9m41-tr8XIym">
// <span class="text-[10px] text-secondary">Pinned by Marcus</span>
// </div>
// </div>
// </section>
// </div>
// <div class="p-md border-t border-surface-variant bg-surface-container-low/30">
// <button class="w-full py-md border border-outline/30 rounded-xl flex items-center justify-center gap-sm text-label-md font-bold text-on-surface hover:bg-surface-container-low transition-colors">
// <span class="material-symbols-outlined">person_add</span>
//                 Invite Members
//             </button>
// </div>
// </aside>
// <script>
//         // Micro-interactions and UI Logic
//         document.addEventListener('DOMContentLoaded', () => {
//             const textarea = document.querySelector('textarea');

//             // Auto-resize textarea
//             textarea.addEventListener('input', function() {
//                 this.style.height = 'auto';
//                 this.style.height = (this.scrollHeight) + 'px';
//                 if (this.scrollHeight > 200) {
//                     this.style.overflowY = 'auto';
//                     this.style.height = '200px';
//                 }
//             });

//             // Handle hover states for reactions via JS for precision if needed
//             const messageGroups = document.querySelectorAll('.message-group');
//             messageGroups.forEach(group => {
//                 group.addEventListener('mouseenter', () => {
//                     // Logic to ensure tooltip position if needed
//                 });
//             });
//         });
//     </script>

// </body></html>
