import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

const KEY = 'aetherium-token';

@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(private http: HttpClient) {}

  login(username: string, password: string): Observable<void> {
    return this.http
      .post<{ token: string }>('http://localhost:8000/auth/login', { username, password })
      .pipe(map(res => { this.setToken(res.token); }));
  }

  setToken(token: string): void { localStorage.setItem(KEY, token); }
  isAuthenticated(): boolean { return !!localStorage.getItem(KEY); }
  logout(): void { localStorage.removeItem(KEY); }
}
