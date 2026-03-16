import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from './api.service';
import { tap } from 'rxjs/operators';

export interface AuthState {
  userId: number | null;
  email: string | null;
  fullName: string | null;
  employeeCode: string | null;
  roleCode: string | null;
  token: string | null;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private router = inject(Router);
  private api = inject(ApiService);

  private readonly TOKEN_KEY = 'apqp_token';
  private readonly USER_KEY = 'apqp_user';

  currentUser = signal<AuthState | null>(this.loadFromStorage());

  login(email: string, password: string) {
    return this.api.login(email, password).pipe(
      tap((res: any) => {
        const state: AuthState = {
          userId: res.userId,
          email: res.email,
          fullName: res.fullName,
          employeeCode: res.employeeCode,
          roleCode: res.roleCode,
          token: res.accessToken
        };
        localStorage.setItem(this.TOKEN_KEY, res.accessToken);
        localStorage.setItem(this.USER_KEY, JSON.stringify(state));
        this.currentUser.set(state);
      })
    );
  }

  logout() {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.currentUser.set(null);
    this.router.navigate(['/auth/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  hasRole(role: string): boolean {
    return this.currentUser()?.roleCode === role;
  }

  private loadFromStorage(): AuthState | null {
    const raw = localStorage.getItem(this.USER_KEY);
    return raw ? JSON.parse(raw) : null;
  }
}
