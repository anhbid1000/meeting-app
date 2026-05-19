// <!DOCTYPE html><html class="light" lang="en"><head>
// <meta charset="utf-8">
// <meta content="width=device-width, initial-scale=1.0" name="viewport">
// <title>ViMeet | Channel Directory</title>
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
//         body { font-family: 'Inter', sans-serif; }
//         .material-symbols-outlined {
//             font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
//         }
//         .active-nav-border { border-left-width: 4px; }
//         .custom-scrollbar::-webkit-scrollbar { width: 6px; }
//         .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
//         .custom-scrollbar::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 10px; }
//         .glass-card { background: rgba(255, 255, 255, 0.8); backdrop-filter: blur(8px); }
//     </style>
// </head>
// <body class="bg-background text-on-background flex h-screen overflow-hidden">
// <!-- SideNavBar (Shared Component) -->
// <aside class="w-sidebar_width h-screen sticky left-0 top-0 bg-surface-container-low flex flex-col py-lg border-r border-surface-variant">
// <div class="px-lg mb-xl">
// <div class="flex items-center gap-md">
// <div class="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-white shadow-lg">
// <span class="material-symbols-outlined" style="font-variation-settings: &quot;FILL&quot; 1;">cloud_done</span>
// </div>
// <div>
// <h1 class="text-headline-sm font-headline-sm text-primary">ViMeet Pro</h1>
// <p class="text-label-sm font-label-sm text-secondary">Enterprise Space</p>
// </div>
// </div>
// </div>
// <nav class="flex-1 px-md space-y-sm overflow-y-auto custom-scrollbar">
// <!-- Navigation items based on JSON -->
// <a class="flex items-center gap-md p-md text-secondary hover:bg-surface-variant rounded-lg transition-all active:scale-98" href="#">
// <span class="material-symbols-outlined">dashboard</span>
// <span class="font-label-md text-label-md">Dashboard</span>
// </a>
// <a class="flex items-center gap-md p-md text-secondary hover:bg-surface-variant rounded-lg transition-all active:scale-98" href="#">
// <span class="material-symbols-outlined">video_chat</span>
// <span class="font-label-md text-label-md">Meetings</span>
// </a>
// <a class="flex items-center gap-md p-md text-secondary hover:bg-surface-variant rounded-lg transition-all active:scale-98" href="#">
// <span class="material-symbols-outlined">group</span>
// <span class="font-label-md text-label-md">Groups</span>
// </a>
// <a class="flex items-center gap-md p-md bg-secondary-container text-primary border-l-4 border-primary rounded-r-lg transition-all active:scale-98" href="#">
// <span class="material-symbols-outlined" style="font-variation-settings: &quot;FILL&quot; 1;">forum</span>
// <span class="font-label-md text-label-md font-bold">Channels</span>
// </a>

// <a class="flex items-center gap-md p-md text-secondary hover:bg-surface-variant rounded-lg transition-all active:scale-98" href="#">
// <span class="material-symbols-outlined">history</span>
// <span class="font-label-md text-label-md">History</span>
// </a>
// <a class="flex items-center gap-md p-md text-secondary hover:bg-surface-variant rounded-lg transition-all active:scale-98" href="#">
// <span class="material-symbols-outlined">folder_open</span>
// <span class="font-label-md text-label-md">Files</span>
// </a>
// </nav>
// <div class="mt-auto px-lg pt-lg">
// <button class="w-full bg-primary text-white py-md px-lg rounded-xl font-label-md text-label-md hover:bg-on-primary-fixed-variant transition-transform active:scale-95 flex items-center justify-center gap-sm shadow-md">
// <span class="material-symbols-outlined">add_circle</span>
//                 Start Meeting
//             </button>
// </div>
// </aside>
// <!-- Main Content Area -->
// <main class="flex-1 flex flex-col h-screen overflow-hidden">
// <!-- TopNavBar (Shared Component) -->
// <header class="flex justify-between items-center px-lg w-full h-16 sticky top-0 z-50 bg-surface-container-lowest border-b border-surface-variant shadow-sm">
// <div class="flex items-center flex-1 max-w-2xl">
// <div class="relative w-full max-w-md">
// <span class="material-symbols-outlined absolute left-md top-1/2 -translate-y-1/2 text-secondary">search</span>
// <input class="w-full pl-xl pr-md py-sm bg-surface-container-low border-none rounded-xl text-body-md focus:ring-2 focus:ring-primary/20" placeholder="Global channel search..." type="text">
// </div>
// </div>
// <div class="flex items-center gap-md">
// <div class="hidden md:flex items-center gap-sm mr-lg">
// <button class="flex items-center gap-xs px-md py-sm rounded-lg hover:bg-surface-container-high text-secondary transition-colors">
// <span class="material-symbols-outlined text-body-md">filter_list</span>
// <span class="text-label-md">Filters</span>
// </button>
// <button class="flex items-center gap-xs px-md py-sm rounded-lg hover:bg-surface-container-high text-secondary transition-colors">
// <span class="material-symbols-outlined text-body-md">sort</span>
// <span class="text-label-md">Sort</span>
// </button>
// </div>
// <button class="p-sm rounded-full text-secondary hover:bg-surface-container-high relative transition-transform active:scale-95">
// <span class="material-symbols-outlined">notifications</span>
// <span class="absolute top-1 right-1 w-2 h-2 bg-error rounded-full"></span>
// </button>
// <button class="p-sm rounded-full text-secondary hover:bg-surface-container-high transition-transform active:scale-95">
// <span class="material-symbols-outlined">settings</span>
// </button>
// <div class="w-10 h-10 rounded-full overflow-hidden border border-outline-variant cursor-pointer active:scale-95 transition-transform">
// <img alt="User profile photo" class="w-full h-full object-cover" data-alt="A professional business headshot of a diverse team leader in a brightly lit, modern corporate office environment with a shallow depth of field, conveying trust and accessibility in a light-mode aesthetic." src="https://lh3.googleusercontent.com/aida-public/AB6AXuANo2z48PTwuFHUngpr2QcnKPyWaGao1-GDmbf4Y3vVh5cEFsQRkJcy7C8lV5PRdQiqe0pnt6ov2O9f8Ua95nKVo5N_ZfZci3_Q3ikA2OXrWNNd_GwYtEg1lkZFYBhqOX7W3gEN_wg-Yqfj6NBYuPnQ-hxZV4xdwMGqve4Ufjb7Lx-YVrfm5Pr0KuAKZ4U3xi4nZKlGmwT-4J_RziKC7dDo4RePQ_yHt6YB-Vskc3zSddVQW2aqzXdiQznZknf_4C3C4k13Bf76nBUS">
// </div>
// </div>
// </header>
// <!-- Directory Header & Controls -->
// <div class="p-lg bg-surface-bright border-b border-surface-variant">
// <div class="flex flex-col md:flex-row md:items-center justify-between gap-md">
// <div>
// <h2 class="text-headline-md font-headline-md text-on-surface">Channel Directory</h2>
// <p class="text-body-sm text-secondary">Discover and join communication spaces across the organization.</p>
// </div>
// <div class="flex flex-wrap gap-sm">
// <select class="bg-surface-container-lowest border border-outline-variant rounded-lg text-label-md px-md py-sm outline-none focus:border-primary">
// <option>All Types</option>
// <option>Public</option>
// <option>Private</option>
// <option>Joined</option>
// </select>
// <select class="bg-surface-container-lowest border border-outline-variant rounded-lg text-label-md px-md py-sm outline-none focus:border-primary">
// <option>Sort: Most Active</option>
// <option>Sort: Alphabetical</option>
// <option>Sort: Member Count</option>
// </select>
// </div>
// </div>
// <!-- Quick Filters (Pills) -->
// <div class="flex gap-sm mt-md overflow-x-auto pb-sm custom-scrollbar">
// <button class="bg-primary text-white px-md py-sm rounded-full text-label-sm whitespace-nowrap">All Channels</button>
// <button class="bg-surface-container-high text-secondary hover:bg-surface-variant px-md py-sm rounded-full text-label-sm whitespace-nowrap transition-colors">Public</button>
// <button class="bg-surface-container-high text-secondary hover:bg-surface-variant px-md py-sm rounded-full text-label-sm whitespace-nowrap transition-colors">Private</button>
// <button class="bg-surface-container-high text-secondary hover:bg-surface-variant px-md py-sm rounded-full text-label-sm whitespace-nowrap transition-colors">Joined</button>
// <button class="bg-surface-container-high text-secondary hover:bg-surface-variant px-md py-sm rounded-full text-label-sm whitespace-nowrap transition-colors">Unread</button>
// <button class="bg-surface-container-high text-secondary hover:bg-surface-variant px-md py-sm rounded-full text-label-sm whitespace-nowrap transition-colors">Favorites</button>
// </div>
// </div>
// <!-- Scrollable Content Area -->
// <div class="flex-1 overflow-y-auto p-lg custom-scrollbar space-y-xl">
// <!-- Category Section: Engineering -->
// <section class="space-y-md">
// <div class="flex items-center justify-between group cursor-pointer">
// <div class="flex items-center gap-sm">
// <span class="material-symbols-outlined text-secondary group-hover:text-primary transition-colors">expand_more</span>
// <h3 class="text-headline-sm font-headline-sm text-on-surface">Engineering</h3>
// <span class="bg-surface-container-high text-secondary text-label-sm px-md py-xs rounded-full">14 Channels</span>
// <span class="text-label-sm text-primary flex items-center gap-xs">
// <span class="w-1.5 h-1.5 bg-primary rounded-full animate-pulse"></span>
//                             4 Active Now
//                         </span>
// </div>
// </div>
// <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-gutter">
// <!-- Channel Card: #development -->
// <div class="bg-surface-container-lowest border border-outline-variant rounded-xl p-md shadow-sm hover:shadow-md transition-shadow group">
// <div class="flex justify-between items-start mb-md">
// <div class="flex items-center gap-md">
// <div class="w-12 h-12 bg-primary-fixed text-primary rounded-xl flex items-center justify-center font-bold text-headline-sm">#</div>
// <div>
// <div class="flex items-center gap-sm">
// <h4 class="font-bold text-on-surface">development</h4>
// <span class="material-symbols-outlined text-primary text-body-md" style="font-variation-settings: &quot;FILL&quot; 1;">star</span>
// </div>
// <div class="flex items-center gap-sm mt-xs">
// <span class="text-label-sm bg-secondary-container text-secondary px-sm py-xs rounded">Public</span>
// <span class="text-label-sm text-secondary flex items-center gap-xs">
// <span class="material-symbols-outlined text-sm">group</span> 1.2k
//                                         </span>
// </div>
// </div>
// </div>
// <span class="bg-primary text-white text-label-sm px-sm py-xs rounded-full min-w-[24px] text-center">12</span>
// </div>
// <div class="bg-surface-container-low rounded-lg p-sm mb-md">
// <div class="flex items-center gap-sm mb-xs">
// <img alt="User avatar" class="w-4 h-4 rounded-full" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAN-JA-IPjI9---gv0IW16PBdyeZv0h9rohIQNPwkoPX8x_QNoIquaHp6OkBPPHGbRAzTzFZiFs7QzssiVTCEVzTUibgsqgtPVIPnEL435bxUD1sDuVKQEj8E_7pxyvjiVPoCTdSHh6eBjHjc5d_u_rd0acKd0UTi7Pvzr94QIcvaTrslz-rkGc3rCLEB7S0PL8Rzds4C2KYis70tnePfh6K450bXA6WJe4PvmJWTxcH3xZ84emNT5CdQ-m_uWEs3-TG0neCfp6i1tj">
// <span class="text-label-sm font-bold text-on-surface">Jane Doe</span>
// <span class="text-label-sm text-secondary ml-auto">2m ago</span>
// </div>
// <p class="text-body-sm text-secondary line-clamp-1 italic">"The latest build for the authentication module is now live in staging..."</p>
// </div>
// <div class="flex items-center justify-between border-t border-surface-variant pt-md">
// <div class="flex items-center -space-x-2">
// <div class="w-6 h-6 rounded-full border-2 border-surface-container-lowest bg-surface-dim"></div>
// <div class="w-6 h-6 rounded-full border-2 border-surface-container-lowest bg-primary-fixed"></div>
// <div class="w-6 h-6 rounded-full border-2 border-surface-container-lowest bg-surface-variant flex items-center justify-center text-[8px] font-bold">+42</div>
// </div>
// <div class="flex items-center gap-sm">
// <button class="p-sm text-secondary hover:text-primary transition-colors"><span class="material-symbols-outlined">notifications_off</span></button>
// <button class="bg-primary-container text-on-primary-container px-lg py-sm rounded-lg text-label-md font-bold hover:opacity-90 transition-all">Join</button>
// </div>
// </div>
// </div>
// <!-- Channel Card: #security-private -->
// <div class="bg-surface-container-lowest border border-outline-variant rounded-xl p-md shadow-sm hover:shadow-md transition-shadow group relative overflow-hidden">
// <div class="absolute top-0 right-0 p-sm">
// <span class="material-symbols-outlined text-error" style="font-variation-settings: &quot;FILL&quot; 1;">lock</span>
// </div>
// <div class="flex justify-between items-start mb-md">
// <div class="flex items-center gap-md">
// <div class="w-12 h-12 bg-surface-variant text-secondary rounded-xl flex items-center justify-center font-bold text-headline-sm">#</div>
// <div>
// <h4 class="font-bold text-on-surface">security-ops</h4>
// <div class="flex items-center gap-sm mt-xs">
// <span class="text-label-sm bg-error-container text-error px-sm py-xs rounded">Private</span>
// <span class="text-label-sm text-secondary flex items-center gap-xs">
// <span class="material-symbols-outlined text-sm">group</span> 45
//                                         </span>
// </div>
// </div>
// </div>
// </div>
// <div class="flex flex-col items-center justify-center py-md space-y-sm text-center">
// <p class="text-body-sm text-secondary px-lg">This is a private space for security operations. Content is restricted.</p>
// <button class="bg-surface-container-high text-on-surface px-lg py-sm rounded-lg text-label-md font-bold border border-outline-variant hover:bg-surface-variant transition-all">Request Access</button>
// </div>
// </div>
// <!-- Channel Card: #dev-ops -->
// <div class="bg-surface-container-lowest border border-outline-variant rounded-xl p-md shadow-sm hover:shadow-md transition-shadow group">
// <div class="flex justify-between items-start mb-md">
// <div class="flex items-center gap-md">
// <div class="w-12 h-12 bg-primary-fixed text-primary rounded-xl flex items-center justify-center font-bold text-headline-sm">#</div>
// <div>
// <h4 class="font-bold text-on-surface">dev-ops</h4>
// <div class="flex items-center gap-sm mt-xs">
// <span class="text-label-sm bg-secondary-container text-secondary px-sm py-xs rounded">Public</span>
// <span class="text-label-sm text-secondary flex items-center gap-xs">
// <span class="material-symbols-outlined text-sm">group</span> 840
//                                         </span>
// </div>
// </div>
// </div>
// </div>
// <div class="bg-surface-container-low rounded-lg p-sm mb-md">
// <div class="flex items-center gap-sm mb-xs">
// <img alt="User avatar" class="w-4 h-4 rounded-full" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCYrP1SgaFn8Ark8RAUOOnytwJd5LWKlBP8GwvCYYeKFwBRSgRzAQ02ecSuq6t7S6q3oBG-YF2mOLpA51LVtDyPxSNBn0HE6qoFjRuy0DLWfl6nR_uci0TJO0qsTpf-hKxkwDB7S-rZnkg03WUaDTdVEhxcJqIG0gTo9-gAAUSc4wSjVFRQAblMXajOvD4Koo6UD_neEx_CIgK-lzqsl7ge0OyutHpJTA2ASWXucZxvVq5KOWhamYfyOZ2P_T4IJqJUEOnCTzGEmN-R">
// <span class="text-label-sm font-bold text-on-surface">Alex Murphy</span>
// <span class="text-label-sm text-secondary ml-auto">1h ago</span>
// </div>
// <p class="text-body-sm text-secondary line-clamp-1 italic">"Monitoring shows stable loads after the recent cluster migration."</p>
// </div>
// <div class="flex items-center justify-between border-t border-surface-variant pt-md">
// <span class="text-label-sm text-error flex items-center gap-xs font-bold">
// <span class="material-symbols-outlined text-sm">alternate_email</span> Mentioned
//                             </span>
// <div class="flex items-center gap-sm">
// <button class="p-sm text-secondary hover:text-primary transition-colors"><span class="material-symbols-outlined">star</span></button>
// <button class="bg-surface-container-high text-secondary px-lg py-sm rounded-lg text-label-md font-bold transition-all">Joined</button>
// </div>
// </div>
// </div>
// </div>
// </section>
// <!-- Category Section: Marketing -->
// <section class="space-y-md">
// <div class="flex items-center justify-between group cursor-pointer">
// <div class="flex items-center gap-sm">
// <span class="material-symbols-outlined text-secondary group-hover:text-primary transition-colors">expand_more</span>
// <h3 class="text-headline-sm font-headline-sm text-on-surface">Marketing</h3>
// <span class="bg-surface-container-high text-secondary text-label-sm px-md py-xs rounded-full">8 Channels</span>
// <span class="text-label-sm text-secondary flex items-center gap-xs">
//                             1 Active Now
//                         </span>
// </div>
// </div>
// <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-gutter">
// <!-- Marketing Card -->
// <div class="bg-surface-container-lowest border border-outline-variant rounded-xl p-md shadow-sm hover:shadow-md transition-shadow group">
// <div class="flex justify-between items-start mb-md">
// <div class="flex items-center gap-md">
// <div class="w-12 h-12 bg-secondary-container text-secondary rounded-xl flex items-center justify-center font-bold text-headline-sm">#</div>
// <div>
// <h4 class="font-bold text-on-surface">marketing-q4</h4>
// <div class="flex items-center gap-sm mt-xs">
// <span class="text-label-sm bg-secondary-container text-secondary px-sm py-xs rounded">Public</span>
// <span class="text-label-sm text-secondary flex items-center gap-xs">
// <span class="material-symbols-outlined text-sm">group</span> 312
//                                         </span>
// </div>
// </div>
// </div>
// </div>
// <div class="bg-surface-container-low rounded-lg p-sm mb-md">
// <div class="flex items-center gap-sm mb-xs">
// <img alt="User avatar" class="w-4 h-4 rounded-full" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAc32vmpGk1OmGvLKWQJsK2bCJN3VhCjegroZYYKDh2nfFvIkK35kNLYBKXwtO1jIywYJSXdkgYjomPqS0o2Jm0v7IDmX1oxnXFQHd7ixpNfaBOoTTTA-sm4ITajk5bAQMgRa3B-VPQONYJwAYt0oAotfmUHocxlC79gJZ3wyQrqV-EZf1nPz_9ZoVppS7PNLJkQzw39g3_zTDpi2yaCMC9GCgOKHqvY9D6uzP8dRRyxZJJb8rnwnwC-oMSHR9diqQbnHwZ6nywS6u0">
// <span class="text-label-sm font-bold text-on-surface">Sarah White</span>
// <span class="text-label-sm text-secondary ml-auto">12h ago</span>
// </div>
// <p class="text-body-sm text-secondary line-clamp-1">"The social media calendar for October is finalized and ready for review."</p>
// </div>
// <div class="flex items-center justify-end border-t border-surface-variant pt-md">
// <button class="bg-primary-container text-on-primary-container px-lg py-sm rounded-lg text-label-md font-bold hover:opacity-90 transition-all">Join Channel</button>
// </div>
// </div>
// <!-- Marketing Card 2 -->
// <div class="bg-surface-container-lowest border border-outline-variant rounded-xl p-md shadow-sm hover:shadow-md transition-shadow group">
// <div class="flex justify-between items-start mb-md">
// <div class="flex items-center gap-md">
// <div class="w-12 h-12 bg-secondary-container text-secondary rounded-xl flex items-center justify-center font-bold text-headline-sm">#</div>
// <div>
// <h4 class="font-bold text-on-surface">brand-assets</h4>
// <div class="flex items-center gap-sm mt-xs">
// <span class="text-label-sm bg-secondary-container text-secondary px-sm py-xs rounded">Public</span>
// <span class="text-label-sm text-secondary flex items-center gap-xs">
// <span class="material-symbols-outlined text-sm">group</span> 128
//                                         </span>
// </div>
// </div>
// </div>
// </div>
// <div class="bg-surface-container-low rounded-lg p-sm mb-md text-center py-lg">
// <span class="material-symbols-outlined text-secondary-dim text-display">photo_library</span>
// <p class="text-body-sm text-secondary mt-sm italic">Pinned files for all active campaigns</p>
// </div>
// <div class="flex items-center justify-between border-t border-surface-variant pt-md">
// <span class="text-label-sm text-secondary">No recent messages</span>
// <button class="bg-primary-container text-on-primary-container px-lg py-sm rounded-lg text-label-md font-bold hover:opacity-90 transition-all">Join</button>
// </div>
// </div>
// </div>
// </section>
// <!-- Category Section: Design -->
// <section class="space-y-md">
// <div class="flex items-center justify-between group cursor-pointer">
// <div class="flex items-center gap-sm">
// <span class="material-symbols-outlined text-secondary group-hover:text-primary transition-colors">expand_more</span>
// <h3 class="text-headline-sm font-headline-sm text-on-surface">Design</h3>
// <span class="bg-surface-container-high text-secondary text-label-sm px-md py-xs rounded-full">5 Channels</span>
// </div>
// </div>
// <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-gutter">
// <!-- Design Card -->
// <div class="bg-surface-container-lowest border border-outline-variant rounded-xl p-md shadow-sm hover:shadow-md transition-shadow group">
// <div class="flex justify-between items-start mb-md">
// <div class="flex items-center gap-md">
// <div class="w-12 h-12 bg-on-secondary-fixed-variant text-white rounded-xl flex items-center justify-center font-bold text-headline-sm">#</div>
// <div>
// <h4 class="font-bold text-on-surface">design-sync</h4>
// <div class="flex items-center gap-sm mt-xs">
// <span class="text-label-sm bg-secondary-container text-secondary px-sm py-xs rounded">Public</span>
// <span class="text-label-sm text-secondary flex items-center gap-xs">
// <span class="material-symbols-outlined text-sm">group</span> 48
//                                         </span>
// </div>
// </div>
// </div>
// <span class="bg-primary text-white text-label-sm px-sm py-xs rounded-full min-w-[24px] text-center">3</span>
// </div>
// <div class="bg-surface-container-low rounded-lg p-sm mb-md">
// <div class="flex items-center gap-sm mb-xs">
// <img alt="User avatar" class="w-4 h-4 rounded-full" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA8pMphM9bM5G5PVGVepB8-x4Km-zPDnCzFTNf93PnwbRpttuG2BBWlzz0qr4hwLXXODhxyNIrKjcHntP43T-LQKsUvlCdO2pNdwgZYmhd7Ox0vIzGVk2uHp2zSJOWuYBI0TpGMHOsFu8f5k_BcWPOyiNEQGAN_jetZ_3j_OtOGf7StfuZsQW0R9PTWb3_kS4ivagVc6z9tOBz9Lmtt2KGSUXvznY0tuHXv808lDyoSX7FvLeNzjo9prL2lDIo5Z4k8imG6xAjZdD5W">
// <span class="text-label-sm font-bold text-on-surface">Ben King</span>
// <span class="text-label-sm text-secondary ml-auto">Just now</span>
// </div>
// <p class="text-body-sm text-secondary line-clamp-1 italic">"Shared the Figma prototype for the new onboarding flow..."</p>
// </div>
// <div class="flex items-center justify-end border-t border-surface-variant pt-md gap-md">
// <button class="p-sm text-secondary hover:text-primary transition-colors"><span class="material-symbols-outlined">notifications</span></button>
// <button class="bg-surface-container-high text-secondary px-lg py-sm rounded-lg text-label-md font-bold transition-all">Joined</button>
// </div>
// </div>
// </div>
// </section>
// </div>
// </main>
// <!-- Floating Create Button (Contextual) -->
// <button class="fixed bottom-lg right-lg w-14 h-14 bg-primary text-white rounded-full flex items-center justify-center shadow-xl hover:scale-110 active:scale-90 transition-transform z-50">
// <span class="material-symbols-outlined text-headline-md">add</span>
// </button>
// <script>
//         // Simple Interaction logic
//         document.querySelectorAll('section > div:first-child').forEach(header => {
//             header.addEventListener('click', () => {
//                 const grid = header.nextElementSibling;
//                 const icon = header.querySelector('.material-symbols-outlined');
//                 if (grid.style.display === 'none') {
//                     grid.style.display = 'grid';
//                     icon.style.transform = 'rotate(0deg)';
//                 } else {
//                     grid.style.display = 'none';
//                     icon.style.transform = 'rotate(-90deg)';
//                 }
//             });
//         });

//         // Hover effects on cards
//         const cards = document.querySelectorAll('.bg-surface-container-lowest');
//         cards.forEach(card => {
//             card.addEventListener('mouseenter', () => {
//                 card.classList.add('scale-[1.01]');
//             });
//             card.addEventListener('mouseleave', () => {
//                 card.classList.remove('scale-[1.01]');
//             });
//         });
//     </script>

// </body></html>
