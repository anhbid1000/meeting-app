import { EventEmitter } from 'events';

/**
 * Lightweight realtime event bus placeholder.
 * This will be replaced by Socket.IO emitter in Phase 5.
 */
class RealtimeBus extends EventEmitter {
  emitEvent(event: string, payload: any) {
    this.emit(event, payload);
    // Temporary console log for visibility
    console.log(`[realtime] ${event}`, payload);
  }
}

export const realtimeBus = new RealtimeBus();
