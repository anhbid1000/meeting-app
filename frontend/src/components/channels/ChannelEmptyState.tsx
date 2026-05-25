export default function ChannelEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <p className="text-lg font-medium text-gray-700 mb-2">
        No channels found
      </p>
      <p className="text-sm text-gray-500">
        Ask the workspace owner to add you to an existing channel, or switch
        filters to find archived and private spaces.
      </p>
    </div>
  );
}
