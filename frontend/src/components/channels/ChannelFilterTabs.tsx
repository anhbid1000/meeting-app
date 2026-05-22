interface Tab {
  id: string;
  label: string;
  type?: 'public' | 'private';
  status?: 'all' | 'joined' | 'unread' | 'favorites' | 'archived';
}

interface ChannelFilterTabsProps {
  activeTab: string;
  onTabChange: (tab: Tab) => void;
}

export default function ChannelFilterTabs({
  activeTab,
  onTabChange,
}: ChannelFilterTabsProps) {
  const tabs: Tab[] = [
    { id: 'all', label: 'All Channels', status: 'all' },
    { id: 'public', label: 'Public', type: 'public' },
    { id: 'private', label: 'Private', type: 'private' },
    { id: 'joined', label: 'Joined', status: 'joined' },
    { id: 'unread', label: 'Unread', status: 'unread' },
    { id: 'favorites', label: 'Favorites', status: 'favorites' },
    { id: 'archived', label: 'Archived', status: 'archived' },
  ];

  return (
    <div className="flex gap-2 mt-4 overflow-x-auto pb-2 custom-scrollbar">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab)}
          className={`px-4 py-2 rounded-full text-xs whitespace-nowrap transition-colors ${
            activeTab === tab.id
              ? 'bg-[#004ac6] text-white'
              : 'bg-[#e7e8ea] text-[#516070] hover:bg-[#e1e2e4]'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
