import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { MetricsSnapshot } from './metrics.model';
import { MetricsSimulator } from './metrics-simulator';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class MetricsSocketService {
  /**
   * Factory used to create the underlying WebSocket. Defaults to the real
   * WebSocket constructor. Exposed as a public settable field (rather than a
   * constructor parameter) so Angular DI can still resolve this service via
   * `providedIn: 'root'` with no arguments; tests can swap it out before
   * calling `connect()`.
   */
  socketFactory: (url: string) => WebSocket = (url) => new WebSocket(url);

  private socket: WebSocket | null = null;
  private backoffMs = 1000;
  private manuallyClosed = false;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private simulator: MetricsSimulator | null = null;
  private mockTimer: ReturnType<typeof setInterval> | null = null;

  private snapshots = new Subject<MetricsSnapshot>();
  private connected = new BehaviorSubject<boolean>(false);
  readonly snapshots$ = this.snapshots.asObservable();
  readonly connected$ = this.connected.asObservable();

  connect(url: string = environment.wsUrl): void {
    if (environment.useMockData) {
      this.manuallyClosed = false;
      this.simulator = new MetricsSimulator();
      this.connected.next(true);
      this.snapshots.next(this.simulator.tick());
      this.mockTimer = setInterval(() => this.snapshots.next(this.simulator!.tick()), 1500);
      return;
    }

    this.manuallyClosed = false;
    this.socket = this.socketFactory(url);
    this.socket.onopen = () => {
      if (this.reconnectTimer) {
        clearTimeout(this.reconnectTimer);
        this.reconnectTimer = null;
      }
      this.connected.next(true);
      this.backoffMs = 1000;
    };
    this.socket.onmessage = (e: MessageEvent) => {
      this.snapshots.next(JSON.parse(e.data) as MetricsSnapshot);
    };
    this.socket.onclose = () => {
      this.connected.next(false);
      if (!this.manuallyClosed) {
        this.reconnectTimer = setTimeout(() => this.connect(url), this.backoffMs);
        this.backoffMs = Math.min(this.backoffMs * 2, 15000);
      }
    };
  }

  disconnect(): void {
    this.manuallyClosed = true;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.mockTimer) {
      clearInterval(this.mockTimer);
      this.mockTimer = null;
    }
    this.simulator = null;
    this.socket?.close();
    this.socket = null;
    this.connected.next(false);
  }
}
