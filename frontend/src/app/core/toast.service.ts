import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Toast {
  id: number;
  message: string;
  level: 'Critical' | 'Warning' | 'Info' | 'success';
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private subject = new BehaviorSubject<Toast[]>([]);
  readonly toasts$: Observable<Toast[]> = this.subject.asObservable();

  private nextId = 1;
  private timers = new Map<number, ReturnType<typeof setTimeout>>();

  show(message: string, level: Toast['level'], ttlMs = 4000): number {
    const id = this.nextId++;
    const toast: Toast = { id, message, level };
    this.subject.next([...this.subject.value, toast]);
    this.timers.set(id, setTimeout(() => this.dismiss(id), ttlMs));
    return id;
  }

  dismiss(id: number): void {
    const timer = this.timers.get(id);
    if (timer) {
      clearTimeout(timer);
      this.timers.delete(id);
    }
    const current = this.subject.value;
    const next = current.filter((t) => t.id !== id);
    if (next.length !== current.length) {
      this.subject.next(next);
    }
  }
}
