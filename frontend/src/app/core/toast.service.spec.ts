import { ToastService } from './toast.service';

describe('ToastService', () => {
  let service: ToastService;

  beforeEach(() => {
    service = new ToastService();
  });

  it('show() adds a toast', (done) => {
    service.show('hi', 'Critical');
    service.toasts$.subscribe((toasts) => {
      expect(toasts.length).toBe(1);
      expect(toasts[0].message).toBe('hi');
      expect(toasts[0].level).toBe('Critical');
      expect(typeof toasts[0].id).toBe('number');
      done();
    });
  });

  it('dismiss(id) removes it', (done) => {
    const id = service.show('bye', 'Info');
    service.dismiss(id);
    service.toasts$.subscribe((toasts) => {
      expect(toasts.length).toBe(0);
      done();
    });
  });

  it('auto-dismisses after ttlMs', () => {
    jasmine.clock().install();
    try {
      service.show('x', 'Info', 1000);
      jasmine.clock().tick(1001);

      let latest: unknown[] = [];
      service.toasts$.subscribe((toasts) => (latest = toasts));
      expect(latest.length).toBe(0);
    } finally {
      jasmine.clock().uninstall();
    }
  });
});
