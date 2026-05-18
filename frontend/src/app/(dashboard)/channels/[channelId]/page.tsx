type Member = {
  name: string;
  role: string;
  status: 'Online' | 'Away' | 'Busy';
};

type Message = {
  user: string;
  time: string;
  text: string;
  reaction?: {
    emoji: string;
    count: number;
  };
};

type SharedFile = {
  name: string;
  size: string;
  time: string;
  icon: string;
  iconClass: string;
};

const members: Member[] = [
  { name: 'Jordan Diaz', role: 'Design Lead', status: 'Online' },
  { name: 'Sarah Reed', role: 'Product Manager', status: 'Online' },
  { name: 'Marcus King', role: 'Frontend Engineer', status: 'Away' },
  { name: 'Alex Tran', role: 'Backend Engineer', status: 'Busy' },
];

const messages: Message[] = [
  {
    user: 'Jordan Diaz',
    time: '4:12 PM',
    text: "Hey team! I've just uploaded the initial wireframes for the new dashboard. Let's take a look during the standup tomorrow.",
    reaction: { emoji: '👍', count: 3 },
  },
  {
    user: 'Sarah Reed',
    time: '4:25 PM',
    text: 'These look solid, Jordan! I especially like the bento-grid approach for the metrics section. It maximizes the vertical space perfectly.',
    reaction: { emoji: '🚀', count: 5 },
  },
  {
    user: 'Marcus King',
    time: '9:10 AM',
    text: "Good morning everyone. I've invited the stakeholders to the review session at 2 PM. Let's make sure the interactive prototype is updated.",
  },
];

const sharedFiles: SharedFile[] = [
  {
    name: 'Design_Specs_Final.pdf',
    size: '3.2 MB',
    time: '2h ago',
    icon: 'picture_as_pdf',
    iconClass: 'bg-red-100 text-red-600',
  },
  {
    name: 'Sprint_Timeline_Q3.xlsx',
    size: '842 KB',
    time: 'Yesterday',
    icon: 'table_chart',
    iconClass: 'bg-blue-100 text-blue-600',
  },
];

const sharedLinks = [
  'figma.com/file/dashboard-v2-wire...',
  'notion.so/project-requirements...',
];

function Icon({ name }: { name: string }) {
  return <span className="material-symbols-outlined">{name}</span>;
}

function Avatar({ name }: { name: string }) {
  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-container-high text-label-md font-semibold text-on-surface">
      {name
        .split(' ')
        .map((part) => part[0])
        .join('')
        .slice(0, 2)}
    </div>
  );
}

function StatusDot({ status }: { status: Member['status'] }) {
  const colorClass =
    status === 'Online'
      ? 'bg-green-500'
      : status === 'Away'
        ? 'bg-amber-500'
        : 'bg-rose-500';

  return (
    <span className={`inline-block h-2.5 w-2.5 rounded-full ${colorClass}`} />
  );
}

export default function ChannelThreadPage({
  params,
}: {
  params: { channelId: string };
}) {
  const channelName = decodeURIComponent(params.channelId).replace(
    /[-_]/g,
    ' '
  );

  return (
    <div className="space-y-lg">
      <header className="flex flex-col gap-md rounded-2xl border border-outline-variant bg-surface px-lg py-md shadow-sm lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full lg:max-w-[50%]">
          <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">
            search
          </span>

          <input
            type="text"
            placeholder="Search conversations and files..."
            className="w-full rounded-lg border border-outline-variant bg-surface-container pl-10 pr-4 py-2 text-body-sm text-on-surface placeholder:text-on-surface-variant"
          />
        </div>

        <div className="flex items-center gap-md text-on-surface-variant">
          <button className="rounded-full p-sm transition-colors hover:bg-surface-container-high hover:text-primary">
            <Icon name="notifications" />
          </button>
          <button className="rounded-full p-sm transition-colors hover:bg-surface-container-high hover:text-primary">
            <Icon name="help" />
          </button>
          <button className="rounded-full p-sm transition-colors hover:bg-surface-container-high hover:text-primary">
            <Icon name="settings" />
          </button>
          <div className="h-8 w-8 rounded-full bg-surface-container-highest" />
        </div>
      </header>

      <section className="grid min-h-[calc(100vh-220px)] overflow-hidden rounded-2xl border border-outline-variant bg-surface shadow-sm xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="flex min-h-0 flex-col border-r border-outline-variant">
          <div className="flex flex-wrap items-start justify-between gap-md border-b border-outline-variant px-lg py-md">
            <div className="space-y-xs">
              <div className="flex items-center gap-xs">
                <span className="text-headline-sm text-on-surface-variant">
                  #
                </span>
                <h1 className="font-headline-sm text-headline-sm text-on-surface">
                  {channelName}
                </h1>
                <Icon name="expand_more" />
              </div>

              <div className="flex items-center gap-sm text-label-sm text-on-surface-variant">
                <span className="flex items-center gap-xs">
                  <Icon name="group" />
                  {members.length} Members
                </span>
                <span className="h-1 w-1 rounded-full bg-outline" />
                <span>Sprint planning for V2 UI refresh</span>
              </div>
            </div>

            <div className="flex items-center gap-sm">
              <button className="rounded-full p-sm text-on-surface-variant transition-colors hover:bg-surface-container-high">
                <Icon name="call" />
              </button>
              <button className="rounded-full p-sm text-on-surface-variant transition-colors hover:bg-surface-container-high">
                <Icon name="videocam" />
              </button>
              <button className="rounded-lg border border-outline px-md py-sm font-label-md text-on-surface transition-colors hover:bg-surface-container-high">
                Invite
              </button>
              <button className="flex items-center gap-xs rounded-lg border border-outline-variant bg-surface-container-low px-md py-sm transition-colors hover:bg-surface-container-high">
                <Icon name="info" />
                <span className="font-label-md text-label-md">
                  Channel Info
                </span>
              </button>
            </div>
          </div>

          <div className="hide-scrollbar flex-1 space-y-lg overflow-y-auto px-lg py-xl">
            <div className="flex justify-center">
              <span className="rounded-full bg-surface-container-high px-md py-xs text-label-sm text-on-surface-variant">
                Yesterday
              </span>
            </div>

            {messages.map((message) => (
              <article
                key={`${message.user}-${message.time}`}
                className="flex gap-md"
              >
                <Avatar name={message.user} />
                <div className="space-y-xs">
                  <div className="flex items-baseline gap-sm">
                    <span className="font-label-md text-on-surface">
                      {message.user}
                    </span>
                    <span className="text-label-sm text-on-surface-variant">
                      {message.time}
                    </span>
                  </div>

                  <p className="max-w-3xl text-body-md leading-relaxed text-on-surface-variant">
                    {message.text}
                  </p>

                  {message.reaction ? (
                    <button className="mt-xs inline-flex items-center gap-xs rounded-full border border-outline-variant bg-surface-container-low px-sm py-0.5">
                      <span>{message.reaction.emoji}</span>
                      <span className="text-label-sm text-on-surface-variant">
                        {message.reaction.count}
                      </span>
                    </button>
                  ) : null}
                </div>
              </article>
            ))}
          </div>

          <div className="border-t border-outline-variant p-lg">
            <div className="rounded-xl border border-outline-variant bg-surface-container-low">
              <div className="flex items-center gap-sm border-b border-outline-variant/50 px-md py-sm text-on-surface-variant">
                <button className="rounded p-xs transition-colors hover:bg-surface-container-high">
                  <Icon name="format_bold" />
                </button>
                <button className="rounded p-xs transition-colors hover:bg-surface-container-high">
                  <Icon name="format_italic" />
                </button>
                <button className="rounded p-xs transition-colors hover:bg-surface-container-high">
                  <Icon name="strikethrough_s" />
                </button>
                <div className="mx-xs h-4 w-px bg-outline-variant" />
                <button className="rounded p-xs transition-colors hover:bg-surface-container-high">
                  <Icon name="link" />
                </button>
                <button className="rounded p-xs transition-colors hover:bg-surface-container-high">
                  <Icon name="format_list_bulleted" />
                </button>
                <button className="rounded p-xs transition-colors hover:bg-surface-container-high">
                  <Icon name="code" />
                </button>
              </div>

              <textarea
                className="h-24 w-full resize-none border-none bg-transparent px-md py-md text-body-md text-on-surface placeholder:text-on-surface-variant focus:ring-0"
                placeholder={`Message #${channelName}`}
              />

              <div className="flex items-center justify-between px-md py-sm">
                <div className="flex items-center gap-sm text-on-surface-variant">
                  <button className="rounded-full p-xs transition-colors hover:bg-surface-container-high">
                    <Icon name="add_circle" />
                  </button>
                  <button className="rounded-full p-xs transition-colors hover:bg-surface-container-high">
                    <Icon name="mood" />
                  </button>
                  <button className="rounded-full p-xs transition-colors hover:bg-surface-container-high">
                    <Icon name="alternate_email" />
                  </button>
                </div>

                <button className="rounded-lg bg-primary p-sm text-on-primary transition-all hover:shadow-md">
                  <Icon name="send" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <aside className="flex min-h-0 flex-col bg-surface-container-low">
          <div className="border-b border-outline-variant p-lg">
            <h2 className="font-headline-sm text-headline-sm text-on-surface">
              Members
            </h2>
            <p className="text-label-sm text-on-surface-variant">
              Team in #{channelName}
            </p>
          </div>

          <div className="hide-scrollbar max-h-64 space-y-xs overflow-y-auto border-b border-outline-variant p-md">
            {members.map((member) => (
              <div
                key={member.name}
                className="rounded-lg bg-surface px-sm py-sm transition-colors hover:bg-surface-container-high"
              >
                <div className="flex items-center justify-between gap-sm">
                  <div className="flex min-w-0 items-center gap-sm">
                    <Avatar name={member.name} />
                    <div className="min-w-0">
                      <p className="truncate font-label-md text-on-surface">
                        {member.name}
                      </p>
                      <p className="truncate text-label-sm text-on-surface-variant">
                        {member.role}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-xs text-label-sm text-on-surface-variant">
                    <StatusDot status={member.status} />
                    <span>{member.status}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="border-b border-outline-variant p-lg">
            <h2 className="font-headline-sm text-headline-sm text-on-surface">
              Shared Files
            </h2>
            <p className="text-label-sm text-on-surface-variant">
              Files shared in #{channelName}
            </p>
          </div>

          <div className="hide-scrollbar flex-1 space-y-md overflow-y-auto px-md py-lg">
            {sharedFiles.map((file) => (
              <div
                key={file.name}
                className="group cursor-pointer rounded-xl border border-outline-variant bg-surface p-md transition-all hover:shadow-sm"
              >
                <div className="flex items-start gap-md">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${file.iconClass}`}
                  >
                    <Icon name={file.icon} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate font-label-md text-on-surface transition-colors group-hover:text-primary">
                      {file.name}
                    </h3>
                    <div className="flex items-center gap-xs text-label-sm text-on-surface-variant">
                      <span>{file.size}</span>
                      <span className="h-1 w-1 rounded-full bg-outline" />
                      <span>{file.time}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <div className="space-y-sm">
              <div className="flex items-center justify-between px-xs">
                <span className="text-label-sm font-bold uppercase tracking-wider text-on-surface-variant">
                  Images (12)
                </span>
                <button className="font-label-md text-label-sm text-primary">
                  View All
                </button>
              </div>

              <div className="grid grid-cols-2 gap-sm">
                <div className="group relative aspect-square overflow-hidden rounded-lg bg-surface-container-highest">
                  <div className="h-full w-full bg-[linear-gradient(140deg,#9ed1ff_0%,#f3f7ff_45%,#5f9ec7_100%)]" />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                    <Icon name="visibility" />
                  </div>
                </div>
                <div className="group relative aspect-square overflow-hidden rounded-lg bg-surface-container-highest">
                  <div className="h-full w-full bg-[linear-gradient(140deg,#d9e2ec_0%,#7f95ab_45%,#1f3142_100%)]" />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                    <Icon name="visibility" />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-sm pt-md">
              <div className="flex items-center justify-between px-xs">
                <span className="text-label-sm font-bold uppercase tracking-wider text-on-surface-variant">
                  Shared Links
                </span>
              </div>
              <div className="space-y-xs">
                {sharedLinks.map((link) => (
                  <a
                    key={link}
                    href="#"
                    className="group flex items-center gap-sm rounded-lg p-sm transition-colors hover:bg-surface-container-high"
                  >
                    <span className="text-on-surface-variant group-hover:text-primary">
                      <Icon name="link" />
                    </span>
                    <span className="truncate text-label-md text-on-surface">
                      {link}
                    </span>
                  </a>
                ))}
              </div>
            </div>
          </div>

          <div className="border-t border-outline-variant bg-surface p-lg">
            <div className="flex items-center justify-between text-label-sm">
              <span className="text-on-surface-variant">Storage Used</span>
              <span className="font-bold text-on-surface">12.8 GB / 50 GB</span>
            </div>
            <div className="mt-sm h-2 w-full overflow-hidden rounded-full bg-surface-container-highest">
              <div className="h-full w-1/4 bg-primary" />
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
}
