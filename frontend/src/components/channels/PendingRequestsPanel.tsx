import { useRejectRequest } from '@/hooks/useChannels';
import { useApproveRequest } from '@/hooks/useChannels';
import { useChannelStore } from '@/store/channelStore';
import { MaterialSymbol } from '@/components/ui/MaterialSymbol';

interface PendingRequestsPanelProps {
  channelId: string;
  canManageRequests?: boolean;
}

export default function PendingRequestsPanel({
  channelId,
  canManageRequests = false,
}: PendingRequestsPanelProps) {
  const { pendingRequests, setPendingRequests } = useChannelStore();
  const approveRequest = useApproveRequest();
  const rejectRequest = useRejectRequest();

  // Filter requests for this channel and pending status
  const requests = pendingRequests.filter(
    (req) => req.channelId === channelId && req.status === 'pending'
  );

  const handleApprove = async (requestId: string) => {
    await approveRequest.mutateAsync({ channelId, requestId });
    setPendingRequests(pendingRequests.filter((req) => req._id !== requestId));
  };

  const handleReject = async (requestId: string) => {
    await rejectRequest.mutateAsync({ channelId, requestId, reason: '' });
    setPendingRequests(pendingRequests.filter((req) => req._id !== requestId));
  };

  if (!canManageRequests || requests.length === 0) {
    return null;
  }

  return (
    <div className="border border-[#c3c6d7] rounded-xl p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-[#191c1e]">Pending Requests</h3>
        <span className="text-sm text-[#516070]">
          {requests.length} pending
        </span>
      </div>
      <div className="space-y-3">
        {requests.map((req) => (
          <div key={req._id} className="border border-[#e1e2e4] rounded-lg p-3">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <MaterialSymbol
                  icon="person"
                  className="w-5 h-5 text-[#516070]"
                />
              </div>
              <div className="flex-1">
                <p className="font-medium text-[#191c1e]">{req.senderId}</p>
                <p className="text-sm text-[#516070]">
                  {req.message || 'No message'}
                </p>
                <div className="flex mt-2 gap-3">
                  <button
                    onClick={() => handleApprove(req._id)}
                    className="flex-1 px-3 py-1.5 bg-[#d5e4f8] text-[#004ac6] rounded hover:bg-[#b9c8db] text-sm"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleReject(req._id)}
                    className="flex-1 px-3 py-1.5 bg-[#ffdad6] text-[#93000a] rounded hover:bg-[#ffcfc8] text-sm"
                  >
                    Reject
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
