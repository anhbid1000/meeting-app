type Channel = {
  name: string;
  message: string;
  members: number;
};

type ChannelGroup = {
  title: string;
  memberCount: number;
  channels: Channel[];
};

const groups: ChannelGroup[] = [
  {
    title: 'Engineering',
    memberCount: 4,
    channels: [
      {
        name: 'development',
        message: 'Alex: Merged the latest PR for the UI shell...',
        members: 128,
      },
      {
        name: 'backend-api',
        message: 'Update on the OAuth2 integration timelines...',
        members: 82,
      },
    ],
  },
  {
    title: 'Marketing',
    memberCount: 2,
    channels: [
      {
        name: 'campaign-q4',
        message: 'James: Ads for the autumn launch are live...',
        members: 42,
      },
    ],
  },
  {
    title: 'Design',
    memberCount: 1,
    channels: [
      {
        name: 'design-sync',
        message: 'Sarah: Shared 4 new screen mockups for...',
        members: 14,
      },
    ],
  },
];

function Icon({ name, filled = false }: { name: string; filled?: boolean }) {
  return (
    <span
      className="material-symbols-outlined"
      style={{
        fontVariationSettings: filled
          ? "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24"
          : "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24",
      }}
    >
      {name}
    </span>
  );
}

export default function ChannelDirectoryPage() {
  return (
    <div className="space-y-xl">
      <section className="space-y-lg">
        <div className="flex flex-col gap-md lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl space-y-sm">
            <p className="font-label-md text-label-md uppercase tracking-[0.2em] text-primary">
              Channels
            </p>
            <h1 className="font-headline-lg text-headline-lg text-on-surface">
              Channel Directory
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Here&apos;s an overview of the channels you are part of.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-sm">
            <button className="rounded-lg border border-outline px-md py-sm font-label-md text-on-surface transition-colors hover:bg-surface-container-high">
              Join Channel
            </button>

            <button className="flex items-center gap-xs rounded-lg bg-primary px-md py-sm font-label-md text-on-primary shadow-sm transition-colors hover:bg-on-primary-fixed-variant">
              <Icon name="add" />
              Create Channel
            </button>
          </div>
        </div>

        <div className="flex max-w-[25%] items-center rounded-full border border-outline-variant bg-surface-container-low px-md py-xs">
          <span className="material-symbols-outlined mr-sm text-on-surface-variant">
            search
          </span>
          <input
            type="text"
            placeholder="Search for channels..."
            className="w-full border-none bg-transparent text-body-md placeholder:text-on-surface-variant focus:ring-0"
          />
        </div>
      </section>

      <div className="space-y-xl">
        {groups.map((group) => (
          <section key={group.title} className="space-y-md">
            <div className="flex items-center justify-between border-b border-outline-variant pb-xs">
              <div className="flex flex-wrap items-center gap-sm">
                <h2 className="font-headline-sm text-headline-sm text-on-surface">
                  {group.title}
                </h2>
                <span className="text-label-md text-on-surface-variant">
                  ({group.memberCount} members)
                </span>
              </div>

              <button className="flex items-center gap-xs font-label-md text-primary hover:underline">
                Join More
                <span className="material-symbols-outlined text-[18px]">
                  arrow_forward
                </span>
              </button>
            </div>

            <div className="grid grid-cols-1 gap-lg md:grid-cols-2 xl:grid-cols-3">
              {group.channels.map((channel) => (
                <div
                  key={channel.name}
                  className="rounded-xl border border-outline-variant bg-surface-container-lowest p-md shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="mb-sm flex items-center justify-between gap-sm">
                    <span className="text-lg font-bold text-primary">
                      #{channel.name}
                    </span>
                    <span className="rounded-full bg-green-100 px-2 py-0.5 text-label-sm font-medium text-green-800">
                      Member
                    </span>
                  </div>

                  <p className="mb-md line-clamp-2 text-body-sm text-on-surface-variant">
                    {channel.message}
                  </p>

                  <div className="flex items-center justify-between gap-md">
                    <div className="flex items-center gap-sm text-label-sm text-on-secondary-container">
                      <span className="material-symbols-outlined text-[16px]">
                        group
                      </span>
                      {channel.members} members
                    </div>

                    <button className="rounded-lg border border-outline-variant px-sm py-1 text-label-sm hover:bg-surface-container-high">
                      Leave
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
