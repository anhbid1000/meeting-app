export default function ChannelCardSkeleton() {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 animate-pulse">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-gray-200 rounded" />
          <div className="h-5 w-32 bg-gray-200 rounded" />
        </div>
        <div className="h-5 w-16 bg-gray-200 rounded" />
      </div>

      <div className="space-y-2 mb-3">
        <div className="h-4 w-full bg-gray-100 rounded" />
        <div className="h-4 w-3/4 bg-gray-100 rounded" />
      </div>

      <div className="flex items-center gap-4 mb-3">
        <div className="h-4 w-20 bg-gray-100 rounded" />
        <div className="h-4 w-20 bg-gray-100 rounded" />
      </div>

      <div className="h-9 w-full bg-gray-100 rounded mt-auto" />
    </div>
  );
}
