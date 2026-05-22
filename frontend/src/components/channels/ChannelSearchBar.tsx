import { Search } from 'lucide-react';

interface ChannelSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function ChannelSearchBar({
  value,
  onChange,
  placeholder = 'Search channels...',
}: ChannelSearchBarProps) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-text"
      />
    </div>
  );
}
