import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, of } from 'rxjs';
import { environment } from '../../environments/environment';

const KEY = 'aetherium-token';

@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(private http: HttpClient) {}

  login(username: string, password: string): Observable<void> {
    if (environment.useMockData) {
      this.setToken('mock-' + Date.now().toString(36));
      return of(undefined);
    }
    return this.http
      .post<{ token: string }>(environment.apiBaseUrl + '/auth/login', { username, password })
      .pipe(map(res => { this.setToken(res.token); }));
  }

  setToken(token: string): void { localStorage.setItem(KEY, token); }
  isAuthenticated(): boolean { return !!localStorage.getItem(KEY); }
  logout(): void { localStorage.removeItem(KEY); }
}
