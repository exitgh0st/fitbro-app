import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap, catchError, of } from 'rxjs';
import { environment } from '../../environments/environment';

export interface AuthUser {
  id: string;
  email: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  private readonly _user = signal<AuthUser | null>(this.loadStoredUser());
  readonly user = this._user.asReadonly();
  readonly isLoggedIn = computed(() => this._user() !== null);

  private get supabaseHeaders(): HttpHeaders {
    return new HttpHeaders({ apikey: environment.supabaseAnonKey });
  }

  login(email: string, password: string) {
    return this.http
      .post<any>(
        `${environment.supabaseUrl}/auth/v1/token?grant_type=password`,
        { email, password },
        { headers: this.supabaseHeaders }
      )
      .pipe(tap((res) => this.storeSession(res)));
  }

  signup(email: string, password: string) {
    return this.http
      .post<any>(
        `${environment.supabaseUrl}/auth/v1/signup`,
        { email, password },
        { headers: this.supabaseHeaders }
      )
      .pipe(tap((res) => { if (res.access_token) this.storeSession(res); }));
  }

  loginWithGoogle() {
    const redirectTo = `${window.location.origin}/auth/callback`;
    window.location.href = `${environment.supabaseUrl}/auth/v1/authorize?provider=google&redirect_to=${encodeURIComponent(redirectTo)}`;
  }

  handleOAuthCallback(fragment: string) {
    const params = new URLSearchParams(fragment.replace(/^#/, ''));
    const accessToken = params.get('access_token');
    const refreshToken = params.get('refresh_token');
    if (accessToken) {
      this.storeSession({ access_token: accessToken, refresh_token: refreshToken });
      this.router.navigate(['/dashboard']);
      return true;
    }
    return false;
  }

  logout() {
    const token = localStorage.getItem('access_token');
    if (token) {
      this.http
        .post(
          `${environment.supabaseUrl}/auth/v1/logout`,
          {},
          { headers: this.supabaseHeaders.set('Authorization', `Bearer ${token}`) }
        )
        .pipe(catchError(() => of(null)))
        .subscribe();
    }
    this.clearSession();
    this.router.navigate(['/auth']);
  }

  getAccessToken(): string | null {
    return localStorage.getItem('access_token');
  }

  storeSession(res: any) {
    if (!res?.access_token) return;
    localStorage.setItem('access_token', res.access_token);
    if (res.refresh_token) localStorage.setItem('refresh_token', res.refresh_token);

    const user: AuthUser = {
      id: res.user?.id ?? this.parseUserIdFromToken(res.access_token),
      email: res.user?.email ?? '',
    };
    localStorage.setItem('fitbro_user', JSON.stringify(user));
    this._user.set(user);
  }

  private clearSession() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('fitbro_user');
    this._user.set(null);
  }

  private loadStoredUser(): AuthUser | null {
    try {
      const raw = localStorage.getItem('fitbro_user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  private parseUserIdFromToken(token: string): string {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.sub ?? '';
    } catch {
      return '';
    }
  }
}
