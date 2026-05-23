import { ChannelJoinRequestService } from '../services/ChannelJoinRequest.service';

describe('Phase 3 service smoke', () => {
  it('exposes required service methods', () => {
    expect(typeof ChannelJoinRequestService.createRequest).toBe('function');
    expect(typeof ChannelJoinRequestService.approveRequest).toBe('function');
    expect(typeof ChannelJoinRequestService.rejectRequest).toBe('function');
    expect(typeof ChannelJoinRequestService.getPendingRequests).toBe('function');
  });
});
