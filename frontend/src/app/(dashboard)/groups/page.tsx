"use client";

import Link from 'next/link';
import {useState} from 'react';
import { CreateWorkspaceModal } from '@/components/workspace/CreateWorkspaceForm';

const Page = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);

  function showCreateWorkspaceModal() {
    setShowCreateModal(true);
  }

  function hideCreateWorkspaceModal() {
    setShowCreateModal(false);
  }

  return (
    <div className="pt-24 px-lg pb-lg">
      {/* Dashboard Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-md mb-xl">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface">
            Groups
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1">
            Manage and collaborate with your workspace teams.
          </p>
        </div>
        <div className="flex items-center gap-md">
          <button className="bg-surface-container-high text-primary px-lg py-md rounded-xl font-label-md text-label-md border border-outline-variant hover:bg-surface-container-highest active:scale-95 transition-all flex items-center gap-sm">
            <span className="material-symbols-outlined">link</span>
            Join Workspace
          </button>
          <button
            onClick={showCreateWorkspaceModal}
            className="bg-primary text-on-primary px-lg py-md rounded-xl font-label-md text-label-md hover:bg-opacity-90 active:scale-95 transition-all shadow-md flex items-center gap-sm"
          >
            <span className="material-symbols-outlined">add_circle</span>
            Create Workspace
          </button>
        </div>
      </div>

      {/* Filtering System */}
      <div className="flex items-center gap-sm mb-lg overflow-x-auto pb-sm">
        <button className="bg-primary text-on-primary px-md py-sm rounded-full font-label-md text-label-md shadow-sm">
          All
        </button>
        <button className="bg-surface-container-high text-on-surface-variant px-md py-sm rounded-full font-label-md text-label-md hover:bg-surface-container-highest transition-colors">
          Internal
        </button>
        <button className="bg-surface-container-high text-on-surface-variant px-md py-sm rounded-full font-label-md text-label-md hover:bg-surface-container-highest transition-colors">
          Client
        </button>
        <button className="bg-surface-container-high text-on-surface-variant px-md py-sm rounded-full font-label-md text-label-md hover:bg-surface-container-highest transition-colors">
          Project-based
        </button>
        <button className="bg-surface-container-high text-on-surface-variant px-md py-sm rounded-full font-label-md text-label-md hover:bg-surface-container-highest transition-colors">
          Design
        </button>
        <button className="bg-surface-container-high text-on-surface-variant px-md py-sm rounded-full font-label-md text-label-md hover:bg-surface-container-highest transition-colors">
          Engineering
        </button>
      </div>

      {/* Grid of Workspace Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-gutter">
        {/* Card 1: Engineering HQ */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md shadow-sm hover:shadow-md transition-all group">
          <div className="relative h-32 rounded-lg overflow-hidden mb-md bg-gradient-to-br from-primary-container to-surface-tint">
            <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors"></div>
            <div className="absolute bottom-3 left-3">
              <span className="bg-surface-bright/90 backdrop-blur-sm text-primary font-label-sm text-label-sm px-2 py-1 rounded-md">
                Engineering
              </span>
            </div>
          </div>
          <h3 className="font-headline-sm text-headline-sm text-on-surface mb-1">
            Engineering HQ
          </h3>
          <div className="flex items-center gap-sm mb-lg">
            <div className="flex -space-x-2">
              <div className="w-6 h-6 rounded-full border-2 border-surface-container-lowest bg-primary-fixed flex items-center justify-center text-[10px] font-bold">
                JD
              </div>
              <div className="w-6 h-6 rounded-full border-2 border-surface-container-lowest bg-secondary-fixed flex items-center justify-center text-[10px] font-bold">
                AS
              </div>
              <div className="w-6 h-6 rounded-full border-2 border-surface-container-lowest bg-tertiary-fixed flex items-center justify-center text-[10px] font-bold">
                MK
              </div>
            </div>
            <span className="font-body-sm text-body-sm text-on-surface-variant">
              24 members
            </span>
          </div>
          <Link
            href={'/groups/1'}
            className="w-full bg-secondary-container text-on-secondary-container py-sm rounded-lg font-label-md text-label-md hover:bg-primary hover:text-on-primary transition-all active:scale-[0.98] text-center block"
          >
            View Workspace
          </Link>
        </div>

        {/* Card 2: Marketing Team */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md shadow-sm hover:shadow-md transition-all group">
          <div className="relative h-32 rounded-lg overflow-hidden mb-md bg-gradient-to-br from-tertiary-container to-on-tertiary-fixed-variant">
            <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors"></div>
            <div className="absolute bottom-3 left-3">
              <span className="bg-surface-bright/90 backdrop-blur-sm text-primary font-label-sm text-label-sm px-2 py-1 rounded-md">
                Internal
              </span>
            </div>
          </div>
          <h3 className="font-headline-sm text-headline-sm text-on-surface mb-1">
            Marketing Team
          </h3>
          <div className="flex items-center gap-sm mb-lg">
            <div className="flex -space-x-2">
              <div className="w-6 h-6 rounded-full border-2 border-surface-container-lowest bg-error-container flex items-center justify-center text-[10px] font-bold">
                RH
              </div>
              <div className="w-6 h-6 rounded-full border-2 border-surface-container-lowest bg-secondary-container flex items-center justify-center text-[10px] font-bold">
                LM
              </div>
              <div className="w-6 h-6 rounded-full border-2 border-surface-container-lowest bg-primary-fixed flex items-center justify-center text-[10px] font-bold">
                EK
              </div>
            </div>
            <span className="font-body-sm text-body-sm text-on-surface-variant">
              18 members
            </span>
          </div>
          <Link
            href={'/groups/2'}
            className="w-full bg-secondary-container text-on-secondary-container py-sm rounded-lg font-label-md text-label-md hover:bg-primary hover:text-on-primary transition-all active:scale-[0.98] text-center block"
          >
            View Workspace
          </Link>
        </div>

        {/* Card 3: Design System */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md shadow-sm hover:shadow-md transition-all group">
          <div className="relative h-32 rounded-lg overflow-hidden mb-md bg-gradient-to-br from-secondary-container to-secondary-fixed">
            <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors"></div>
            <div className="absolute bottom-3 left-3">
              <span className="bg-surface-bright/90 backdrop-blur-sm text-primary font-label-sm text-label-sm px-2 py-1 rounded-md">
                Design
              </span>
            </div>
          </div>
          <h3 className="font-headline-sm text-headline-sm text-on-surface mb-1">
            Design System
          </h3>
          <div className="flex items-center gap-sm mb-lg">
            <div className="flex -space-x-2">
              <div className="w-6 h-6 rounded-full border-2 border-surface-container-lowest bg-tertiary-fixed flex items-center justify-center text-[10px] font-bold">
                TS
              </div>
              <div className="w-6 h-6 rounded-full border-2 border-surface-container-lowest bg-primary-container flex items-center justify-center text-[10px] font-bold">
                NC
              </div>
            </div>
            <span className="font-body-sm text-body-sm text-on-surface-variant">
              12 members
            </span>
          </div>
          <Link
            href={'/groups/3'}
            className="w-full bg-secondary-container text-on-secondary-container py-sm rounded-lg font-label-md text-label-md hover:bg-primary hover:text-on-primary transition-all active:scale-[0.98] text-center block"
          >
            View Workspace
          </Link>
        </div>

        {/* Card 4: Product Ops */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md shadow-sm hover:shadow-md transition-all group">
          <div className="relative h-32 rounded-lg overflow-hidden mb-md bg-gradient-to-br from-error-container/30 to-error/20">
            <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors"></div>
            <div className="absolute bottom-3 left-3">
              <span className="bg-surface-bright/90 backdrop-blur-sm text-primary font-label-sm text-label-sm px-2 py-1 rounded-md">
                Operations
              </span>
            </div>
          </div>
          <h3 className="font-headline-sm text-headline-sm text-on-surface mb-1">
            Product Ops
          </h3>
          <div className="flex items-center gap-sm mb-lg">
            <div className="flex -space-x-2">
              <div className="w-6 h-6 rounded-full border-2 border-surface-container-lowest bg-secondary-fixed flex items-center justify-center text-[10px] font-bold">
                PJ
              </div>
              <div className="w-6 h-6 rounded-full border-2 border-surface-container-lowest bg-tertiary-fixed flex items-center justify-center text-[10px] font-bold">
                DW
              </div>
              <div className="w-6 h-6 rounded-full border-2 border-surface-container-lowest bg-primary-fixed flex items-center justify-center text-[10px] font-bold">
                HP
              </div>
            </div>
            <span className="font-body-sm text-body-sm text-on-surface-variant">
              16 members
            </span>
          </div>
          <Link
            href={'/groups/4'}
            className="w-full bg-secondary-container text-on-secondary-container py-sm rounded-lg font-label-md text-label-md hover:bg-primary hover:text-on-primary transition-all active:scale-[0.98] text-center block"
          >
            View Workspace
          </Link>
        </div>

        {/* Card 5: Client Success */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md shadow-sm hover:shadow-md transition-all group">
          <div className="relative h-32 rounded-lg overflow-hidden mb-md bg-gradient-to-br from-primary/30 to-secondary-container/40">
            <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors"></div>
            <div className="absolute bottom-3 left-3">
              <span className="bg-surface-bright/90 backdrop-blur-sm text-primary font-label-sm text-label-sm px-2 py-1 rounded-md">
                Client
              </span>
            </div>
          </div>
          <h3 className="font-headline-sm text-headline-sm text-on-surface mb-1">
            Client Success
          </h3>
          <div className="flex items-center gap-sm mb-lg">
            <div className="flex -space-x-2">
              <div className="w-6 h-6 rounded-full border-2 border-surface-container-lowest bg-primary-fixed flex items-center justify-center text-[10px] font-bold">
                SG
              </div>
              <div className="w-6 h-6 rounded-full border-2 border-surface-container-lowest bg-secondary-fixed flex items-center justify-center text-[10px] font-bold">
                MB
              </div>
            </div>
            <span className="font-body-sm text-body-sm text-on-surface-variant">
              22 members
            </span>
          </div>
          <Link
            href={'/groups/5'}
            className="w-full bg-secondary-container text-on-secondary-container py-sm rounded-lg font-label-md text-label-md hover:bg-primary hover:text-on-primary transition-all active:scale-[0.98] text-center block"
          >
            View Workspace
          </Link>
        </div>

        {/* Card 6: Infrastructure */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md shadow-sm hover:shadow-md transition-all group">
          <div className="relative h-32 rounded-lg overflow-hidden mb-md bg-gradient-to-br from-tertiary-fixed-dim to-on-tertiary-fixed">
            <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors"></div>
            <div className="absolute bottom-3 left-3">
              <span className="bg-surface-bright/90 backdrop-blur-sm text-primary font-label-sm text-label-sm px-2 py-1 rounded-md">
                Engineering
              </span>
            </div>
          </div>
          <h3 className="font-headline-sm text-headline-sm text-on-surface mb-1">
            Infrastructure
          </h3>
          <div className="flex items-center gap-sm mb-lg">
            <div className="flex -space-x-2">
              <div className="w-6 h-6 rounded-full border-2 border-surface-container-lowest bg-tertiary-fixed flex items-center justify-center text-[10px] font-bold">
                KL
              </div>
              <div className="w-6 h-6 rounded-full border-2 border-surface-container-lowest bg-secondary-fixed flex items-center justify-center text-[10px] font-bold">
                VP
              </div>
              <div className="w-6 h-6 rounded-full border-2 border-surface-container-lowest bg-primary-fixed flex items-center justify-center text-[10px] font-bold">
                JM
              </div>
            </div>
            <span className="font-body-sm text-body-sm text-on-surface-variant">
              14 members
            </span>
          </div>
          <Link
            href={'/groups/6'}
            className="w-full bg-secondary-container text-on-secondary-container py-sm rounded-lg font-label-md text-label-md hover:bg-primary hover:text-on-primary transition-all active:scale-[0.98] text-center block"
          >
            View Workspace
          </Link>
        </div>
      </div>

      <CreateWorkspaceModal
        open={showCreateModal}
        onClose={hideCreateWorkspaceModal}
      />

      {/* Workspace Analytics / Activity (Bento Section) */}
      <div className="mt-xl grid grid-cols-1 lg:grid-cols-4 gap-gutter">
        <div className="lg:col-span-3 bg-surface-container-lowest rounded-xl border border-outline-variant p-lg">
          <div className="flex items-center justify-between mb-lg">
            <h2 className="font-headline-sm text-headline-sm text-on-surface">
              Recent Workspace Activity
            </h2>
            <button className="text-primary font-label-md text-label-md hover:underline">
              See all updates
            </button>
          </div>
          <div className="space-y-md">
            <div className="flex items-start gap-md p-md rounded-lg bg-surface-container-low">
              <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container shrink-0">
                <span className="material-symbols-outlined">forum</span>
              </div>
              <div>
                <p className="font-body-md text-body-md text-on-surface">
                  <strong>Sarah Chen</strong> posted a new update in{' '}
                  <strong>Engineering HQ</strong>
                </p>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  "The architectural review is complete. Moving to
                  implementation phase..."
                </p>
                <span className="font-label-sm text-label-sm text-outline mt-1 block">
                  2 hours ago
                </span>
              </div>
            </div>
            <div className="flex items-start gap-md p-md rounded-lg">
              <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container shrink-0">
                <span className="material-symbols-outlined">video_chat</span>
              </div>
              <div>
                <p className="font-body-md text-body-md text-on-surface">
                  New meeting scheduled: <strong>Weekly Sync</strong> in{' '}
                  <strong>Marketing Team</strong>
                </p>
                <span className="font-label-sm text-label-sm text-outline mt-1 block">
                  4 hours ago
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-primary text-on-primary rounded-xl p-lg flex flex-col justify-between overflow-hidden relative">
          <div className="absolute -right-8 -top-8 w-32 h-32 bg-on-primary/10 rounded-full blur-2xl"></div>
          <div>
            <span className="material-symbols-outlined text-4xl mb-md">
              workspace_premium
            </span>
            <h3 className="font-headline-sm text-headline-sm mb-xs">
              Pro Workspace
            </h3>
            <p className="font-body-sm text-body-sm opacity-90">
              Unlock advanced analytics and unlimited members for your teams.
            </p>
          </div>
          <button className="mt-xl w-full bg-on-primary text-primary py-sm rounded-lg font-label-md text-label-md hover:bg-primary-fixed transition-all">
            Upgrade Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default Page;
