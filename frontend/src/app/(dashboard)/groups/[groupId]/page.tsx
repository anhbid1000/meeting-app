const Page = () => {
  return (
    <main className="pt-16 min-h-screen">
      <div className="p-lg max-w-7xl mx-auto">
        {/* Group Header Section */}
        <section className="bg-surface-container-lowest rounded-xl border border-outline-variant p-xl mb-lg shadow-sm">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-lg">
            <div className="flex gap-xl items-start">
              <div className="w-20 h-20 bg-primary-container rounded-2xl flex items-center justify-center text-on-primary-container">
                <span
                  className="material-symbols-outlined text-[40px]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  terminal
                </span>
              </div>
              <div>
                <div className="flex items-center gap-sm mb-xs">
                  <h2 className="font-headline-lg text-headline-lg text-on-surface">
                    Engineering HQ
                  </h2>
                  <span className="bg-secondary-container text-on-secondary-container px-sm py-0.5 rounded-full font-label-sm text-label-sm">
                    Official
                  </span>
                </div>
                <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl mb-md">
                  Central hub for all engineering operations, architectural
                  reviews, and cross-functional infrastructure alignment. We
                  build for scale and reliability.
                </p>
                <div className="flex items-center gap-xl">
                  <div className="flex items-center gap-xs">
                    <span className="material-symbols-outlined text-outline text-md">
                      group
                    </span>
                    <span className="font-label-md text-label-md text-on-surface">
                      142 Members
                    </span>
                  </div>
                  <div className="flex items-center gap-xs">
                    <span className="material-symbols-outlined text-outline text-md">
                      shield_person
                    </span>
                    <span className="font-label-md text-label-md text-on-surface">
                      Admin: <span className="font-bold">Sarah Chen</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-xs">
                    <span className="material-symbols-outlined text-outline text-md">
                      calendar_month
                    </span>
                    <span className="font-label-md text-label-md text-on-surface">
                      Created March 2024
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex gap-sm">
              <button className="px-lg py-md border border-outline text-primary font-label-md text-label-md rounded-xl hover:bg-surface-container transition-colors">
                Manage Group
              </button>
              <button className="px-lg py-md bg-primary text-on-primary font-label-md text-label-md rounded-xl shadow-sm hover:opacity-90 active:scale-95 transition-all">
                Invite Others
              </button>
            </div>
          </div>
        </section>

        {/* Channels Section */}
        <div className="flex items-center justify-between mb-md">
          <h3 className="font-headline-sm text-headline-sm text-on-surface">
            Channels (8)
          </h3>
          <div className="flex gap-sm">
            <button className="flex items-center gap-xs text-on-surface-variant font-label-md text-label-md hover:text-primary transition-colors">
              <span className="material-symbols-outlined text-md">
                filter_list
              </span>{' '}
              Filter
            </button>
            <button className="flex items-center gap-xs text-on-surface-variant font-label-md text-label-md hover:text-primary transition-colors">
              <span className="material-symbols-outlined text-md">sort</span>{' '}
              Sort
            </button>
          </div>
        </div>

        {/* Bento-style Channel Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter">
          {/* Channel Card: #general */}
          <div className="bg-surface-container-lowest p-lg rounded-xl border border-outline-variant hover:shadow-md transition-all group">
            <div className="flex justify-between items-start mb-md">
              <div className="flex items-center gap-sm">
                <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined">tag</span>
                </div>
                <div>
                  <h4 className="font-headline-sm text-headline-sm text-on-surface group-hover:text-primary transition-colors">
                    general
                  </h4>
                  <span className="font-label-sm text-label-sm text-on-surface-variant">
                    Public Channel
                  </span>
                </div>
              </div>
              <span
                className="flex h-2 w-2 rounded-full bg-green-500"
                title="Active now"
              ></span>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant mb-lg line-clamp-2">
              Company-wide announcements and general engineering discussion for
              the entire HQ team.
            </p>
            <div className="flex items-center justify-between mt-auto">
              <div className="flex -space-x-2">
                <img
                  alt="User 1"
                  className="w-8 h-8 rounded-full border-2 border-surface-container-lowest"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuC0GoT4FvkHb1SbdJxdFnyZ1jEabQSq0Xffb_TD8_hZENiDFvE1RZGJnc3yrzhO3yjzz07jOW6KDH_1dOg_ctam3152kqKt9rLTVQ9Nz9GdTZ_5fmtsh8_FkjduMAZgcgCS67jAA-k2mhVrUSJ5LYKuz_SydZBa36tXZGS-7ZdKQilk68bqROfbTLYH1FwfJfTVr0_21qEabBijpHCg-1V5LbCmdxnoUIXyCZMD_0IQEBPKdDuzmrXs4UFxZerwCckWjXT69HxL5lyL"
                />
                <img
                  alt="User 2"
                  className="w-8 h-8 rounded-full border-2 border-surface-container-lowest"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuC1sJ6CuG5jLRKpXLmCMOFndV7PeSlL0ng71qheUAEKmVaEJ4MQZydA2T7vaV0OKvt38m3nQ7-rYozztkulskjal1pVQIj5mjtFHyF_8aiulhHqkluVbcd8Nr5EA4_pB29VbhDWJMFUSlZbrpUkKo2VuID6wmWDJ4KKTS8PTIPCMMMPCmuv1v8O7tiW92RVoETKsojgBcmiyXCHXgjAfEVKKYypo5cJJLoY6VIWBMEKuhUVgq02tg_-4RuCsD9YXHcddzlyJgOqMz6T"
                />
                <div className="w-8 h-8 rounded-full border-2 border-surface-container-lowest bg-surface-container text-[10px] font-bold flex items-center justify-center text-on-surface-variant">
                  +138
                </div>
              </div>
              <button className="font-label-md text-label-md text-primary bg-secondary-container px-md py-sm rounded-lg hover:bg-primary hover:text-on-primary transition-all">
                Join Channel
              </button>
            </div>
          </div>

          {/* Channel Card: #frontend-dev */}
          <div className="bg-surface-container-lowest p-lg rounded-xl border border-outline-variant hover:shadow-md transition-all group">
            <div className="flex justify-between items-start mb-md">
              <div className="flex items-center gap-sm">
                <div className="w-10 h-10 rounded-lg bg-secondary-container flex items-center justify-center text-on-secondary-container">
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>tag</span>
                </div>
                <div>
                  <h4 className="font-headline-sm text-headline-sm text-on-surface group-hover:text-primary transition-colors">
                    frontend-dev
                  </h4>
                  <span className="font-label-sm text-label-sm text-on-surface-variant">
                    Private Channel
                  </span>
                </div>
              </div>
              <span className="flex h-2 w-2 rounded-full bg-yellow-500" title="Moderate activity"></span>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant mb-lg line-clamp-2">
              React, TypeScript, and UI frameworks discussion for frontend development team.
            </p>
            <div className="flex items-center justify-between mt-auto">
              <div className="flex -space-x-2">
                <div className="w-8 h-8 rounded-full border-2 border-surface-container-lowest bg-primary-fixed flex items-center justify-center text-[10px] font-bold">SK</div>
                <div className="w-8 h-8 rounded-full border-2 border-surface-container-lowest bg-secondary-container flex items-center justify-center text-[10px] font-bold">MJ</div>
                <div className="w-8 h-8 rounded-full border-2 border-surface-container-lowest bg-tertiary-fixed flex items-center justify-center text-[10px] font-bold">+42</div>
              </div>
              <button className="font-label-md text-label-md text-primary bg-secondary-container px-md py-sm rounded-lg hover:bg-primary hover:text-on-primary transition-all">
                Join Channel
              </button>
            </div>
          </div>

          {/* Channel Card: #backend-api */}
          <div className="bg-surface-container-lowest p-lg rounded-xl border border-outline-variant hover:shadow-md transition-all group">
            <div className="flex justify-between items-start mb-md">
              <div className="flex items-center gap-sm">
                <div className="w-10 h-10 rounded-lg bg-primary-container flex items-center justify-center text-on-primary-container">
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>tag</span>
                </div>
                <div>
                  <h4 className="font-headline-sm text-headline-sm text-on-surface group-hover:text-primary transition-colors">
                    backend-api
                  </h4>
                  <span className="font-label-sm text-label-sm text-on-surface-variant">
                    Private Channel
                  </span>
                </div>
              </div>
              <span className="flex h-2 w-2 rounded-full bg-green-500" title="Active now"></span>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant mb-lg line-clamp-2">
              Node.js, Express, database schemas, and API architecture discussions.
            </p>
            <div className="flex items-center justify-between mt-auto">
              <div className="flex -space-x-2">
                <div className="w-8 h-8 rounded-full border-2 border-surface-container-lowest bg-secondary-fixed flex items-center justify-center text-[10px] font-bold">AM</div>
                <div className="w-8 h-8 rounded-full border-2 border-surface-container-lowest bg-tertiary-fixed flex items-center justify-center text-[10px] font-bold">RL</div>
                <div className="w-8 h-8 rounded-full border-2 border-surface-container-lowest bg-primary-fixed flex items-center justify-center text-[10px] font-bold">+38</div>
              </div>
              <button className="font-label-md text-label-md text-primary bg-secondary-container px-md py-sm rounded-lg hover:bg-primary hover:text-on-primary transition-all">
                Join Channel
              </button>
            </div>
          </div>

          {/* Channel Card: #devops */}
          <div className="bg-surface-container-lowest p-lg rounded-xl border border-outline-variant hover:shadow-md transition-all group">
            <div className="flex justify-between items-start mb-md">
              <div className="flex items-center gap-sm">
                <div className="w-10 h-10 rounded-lg bg-tertiary-container flex items-center justify-center text-on-tertiary-container">
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>tag</span>
                </div>
                <div>
                  <h4 className="font-headline-sm text-headline-sm text-on-surface group-hover:text-primary transition-colors">
                    devops
                  </h4>
                  <span className="font-label-sm text-label-sm text-on-surface-variant">
                    Private Channel
                  </span>
                </div>
              </div>
              <span className="flex h-2 w-2 rounded-full bg-green-500" title="Active now"></span>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant mb-lg line-clamp-2">
              CI/CD pipelines, Docker, Kubernetes, and infrastructure automation.
            </p>
            <div className="flex items-center justify-between mt-auto">
              <div className="flex -space-x-2">
                <div className="w-8 h-8 rounded-full border-2 border-surface-container-lowest bg-primary-fixed flex items-center justify-center text-[10px] font-bold">DP</div>
                <div className="w-8 h-8 rounded-full border-2 border-surface-container-lowest bg-secondary-fixed flex items-center justify-center text-[10px] font-bold">CT</div>
                <div className="w-8 h-8 rounded-full border-2 border-surface-container-lowest bg-tertiary-fixed flex items-center justify-center text-[10px] font-bold">+18</div>
              </div>
              <button className="font-label-md text-label-md text-primary bg-secondary-container px-md py-sm rounded-lg hover:bg-primary hover:text-on-primary transition-all">
                Join Channel
              </button>
            </div>
          </div>

          {/* Channel Card: #incident-response */}
          <div className="bg-error-container/20 p-lg rounded-xl border border-error/20 hover:shadow-md transition-all group">
            <div className="flex justify-between items-start mb-md">
              <div className="flex items-center gap-sm">
                <div className="w-10 h-10 rounded-lg bg-error-container flex items-center justify-center text-on-error-container">
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>warning</span>
                </div>
                <div>
                  <h4 className="font-headline-sm text-headline-sm text-on-surface">incident-response</h4>
                  <span className="font-label-sm text-label-sm text-error">High Priority</span>
                </div>
              </div>
              <span className="flex h-2 w-2 rounded-full bg-error animate-pulse" title="Critical"></span>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant mb-lg line-clamp-2">
              Critical coordination channel for live site incidents and production bug tracking.
            </p>
            <div className="flex items-center justify-between mt-auto">
              <div className="flex -space-x-2">
                <div className="w-8 h-8 rounded-full border-2 border-surface-container-lowest bg-error-container flex items-center justify-center text-[10px] font-bold">SR</div>
                <div className="w-8 h-8 rounded-full border-2 border-surface-container-lowest bg-secondary-fixed flex items-center justify-center text-[10px] font-bold">NX</div>
                <div className="w-8 h-8 rounded-full border-2 border-surface-container-lowest bg-primary-fixed flex items-center justify-center text-[10px] font-bold">+5</div>
              </div>
              <button className="font-label-md text-label-md text-on-error bg-error px-md py-sm rounded-lg hover:opacity-90 transition-all">
                Join Crisis Thread
              </button>
            </div>
          </div>

          {/* Channel Card: #project-brainstorm */}
          <div className="bg-surface-container-lowest p-lg rounded-xl border border-outline-variant hover:shadow-md transition-all group">
            <div className="flex justify-between items-start mb-md">
              <div className="flex items-center gap-sm">
                <div className="w-10 h-10 rounded-lg bg-secondary-container flex items-center justify-center text-on-secondary-container">
                  <span className="material-symbols-outlined">lightbulb</span>
                </div>
                <div>
                  <h4 className="font-headline-sm text-headline-sm text-on-surface group-hover:text-primary transition-colors">
                    project-brainstorm
                  </h4>
                  <span className="font-label-sm text-label-sm text-on-surface-variant">
                    Open Channel
                  </span>
                </div>
              </div>
              <span className="flex h-2 w-2 rounded-full bg-blue-500" title="Minimal activity"></span>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant mb-lg line-clamp-2">
              Creative ideation and innovation space for new project proposals.
            </p>
            <div className="flex items-center justify-between mt-auto">
              <div className="flex -space-x-2">
                <div className="w-8 h-8 rounded-full border-2 border-surface-container-lowest bg-primary-fixed flex items-center justify-center text-[10px] font-bold">BI</div>
                <div className="w-8 h-8 rounded-full border-2 border-surface-container-lowest bg-tertiary-fixed flex items-center justify-center text-[10px] font-bold">+65</div>
              </div>
              <button className="font-label-md text-label-md text-primary bg-secondary-container px-md py-sm rounded-lg hover:bg-primary hover:text-on-primary transition-all">
                Join Channel
              </button>
            </div>
          </div>

          {/* Add New Channel Placeholder */}
          <div className="border-2 border-dashed border-outline-variant p-lg rounded-xl flex flex-col items-center justify-center gap-md hover:bg-surface-container transition-colors cursor-pointer group">
            <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center text-outline group-hover:text-primary transition-colors">
              <span className="material-symbols-outlined text-3xl">add_circle</span>
            </div>
            <div className="text-center">
              <h4 className="font-headline-sm text-headline-sm text-on-surface-variant group-hover:text-primary">Create Channel</h4>
              <p className="font-body-sm text-body-sm text-outline">Start a new space for your sub-team</p>
            </div>
          </div>
        </div>
      </div>

      {/* FAB Action (Contextual for Hub) */}
      <button className="fixed bottom-lg right-lg w-14 h-14 bg-primary text-on-primary rounded-full shadow-lg flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-50">
        <span className="material-symbols-outlined text-3xl">chat_add_on</span>
      </button>
    </main>
  );
};

export default Page;
