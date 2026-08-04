import { MetricsSocketService } from './metrics-socket.service';
import { MetricsSnapshot } from './metrics.model';

class FakeSocket {
  onopen: (() => void) | null = null;
  onclose: (() => void) | null = null;
  onmessage: ((e: { data: string }) => void) | null = null;
  close() { this.onclose?.(); }
  emit(snap: MetricsSnapshot) { this.onmessage?.({ data: JSON.stringify(snap) }); }
}

function sample(): MetricsSnapshot {
  return {
    timestamp: 't', kpis: { totalPredictions: 1, modelAccuracy: 96.7, dataPoints: 2, activeModels: 42 },
    accuracyTrend: [], modelUsage: [], sourceLatencies: [], recentAlerts: [], topModels: [],
  };
}

describe('MetricsSocketService', () => {
  it('emits parsed snapshots from socket messages', () => {
    const fake = new FakeSocket();
    const service = new MetricsSocketService();
    service.socketFactory = () => fake as unknown as WebSocket;
    const received: MetricsSnapshot[] = [];
    service.snapshots$.subscribe((s: MetricsSnapshot) => received.push(s));
    service.connect();
    fake.onopen?.();
    fake.emit(sample());
    expect(received.length).toBe(1);
    expect(received[0].kpis.modelAccuracy).toBe(96.7);
  });

  it('tracks connected state', () => {
    const fake = new FakeSocket();
    const service = new MetricsSocketService();
    service.socketFactory = () => fake as unknown as WebSocket;
    const states: boolean[] = [];
    service.connected$.subscribe((s: boolean) => states.push(s));
    service.connect();
    fake.onopen?.();
    expect(states[states.length - 1]).toBe(true);
  });

  it('does not reconnect after disconnect cancels a pending reconnect timer', () => {
    jasmine.clock().install();
    try {
      let factoryCalls = 0;
      const service = new MetricsSocketService();
      let currentFake = new FakeSocket();
      service.socketFactory = () => {
        factoryCalls++;
        currentFake = new FakeSocket();
        return currentFake as unknown as WebSocket;
      };

      service.connect();
      expect(factoryCalls).toBe(1);
      currentFake.onopen?.();

      // Simulate the server dropping the connection, which schedules a reconnect.
      currentFake.onclose?.();

      // Disconnect before the pending reconnect timer fires.
      service.disconnect();

      // Advance well past the backoff delay.
      jasmine.clock().tick(20000);

      expect(factoryCalls).toBe(1);
    } finally {
      jasmine.clock().uninstall();
    }
  });
});
