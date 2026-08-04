import { AuthService } from './auth.service';

describe('AuthService', () => {
  beforeEach(() => localStorage.clear());

  it('is unauthenticated with no token', () => {
    const http = { post: () => ({ subscribe: () => {} }) } as any;
    const service = new AuthService(http);
    expect(service.isAuthenticated()).toBe(false);
  });

  it('stores token and reports authenticated after setToken', () => {
    const http = {} as any;
    const service = new AuthService(http);
    service.setToken('abc');
    expect(service.isAuthenticated()).toBe(true);
    service.logout();
    expect(service.isAuthenticated()).toBe(false);
  });
});
