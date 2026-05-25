import { MessageService } from '../services/Message.service';
import { MessageDAO } from '../dao/MessageDAO';

describe('Phase 4 smoke', () => {
  it('MessageService exposes all required methods', () => {
    expect(typeof MessageService.sendMessage).toBe('function');
    expect(typeof MessageService.getMessages).toBe('function');
    expect(typeof MessageService.editMessage).toBe('function');
    expect(typeof MessageService.deleteMessage).toBe('function');
    expect(typeof MessageService.pinMessage).toBe('function');
    expect(typeof MessageService.unpinMessage).toBe('function');
  });

  it('MessageDAO exposes all required methods', () => {
    const dao = new MessageDAO();
    expect(typeof dao.findByChannel).toBe('function');
    expect(typeof dao.findById).toBe('function');
    expect(typeof dao.findByIdWithDetails).toBe('function');
    expect(typeof dao.create).toBe('function');
    expect(typeof dao.update).toBe('function');
    expect(typeof dao.delete).toBe('function');
    expect(typeof dao.incrementThreadCount).toBe('function');
  });
});
