import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="auth-page">
      <div class="auth-card">
        <div class="brand">
          <span class="brand-icon">⚡</span>
          <h1>FitBro</h1>
          <p>Your AI-powered fitness coach</p>
        </div>

        @if (error()) {
          <div class="error-banner">{{ error() }}</div>
        }

        @if (message()) {
          <div class="success-banner">{{ message() }}</div>
        }

        <div class="tabs">
          <button [class.active]="mode() === 'login'" (click)="mode.set('login')">Sign In</button>
          <button [class.active]="mode() === 'signup'" (click)="mode.set('signup')">Sign Up</button>
        </div>

        <form (ngSubmit)="submit()" #authForm="ngForm">
          <div class="field">
            <label>Email</label>
            <input type="email" [(ngModel)]="email" name="email" required autocomplete="email" />
          </div>
          <div class="field">
            <label>Password</label>
            <input type="password" [(ngModel)]="password" name="password" required autocomplete="current-password" minlength="6" />
          </div>
          <button type="submit" class="btn-primary" [disabled]="loading()">
            {{ loading() ? 'Please wait...' : (mode() === 'login' ? 'Sign In' : 'Create Account') }}
          </button>
        </form>

        <div class="divider"><span>or</span></div>

        <button class="btn-google" (click)="googleLogin()" [disabled]="loading()">
          <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/><path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"/><path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/><path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"/></svg>
          Continue with Google
        </button>
      </div>
    </div>
  `,
  styles: [`
    .auth-page {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--bg-primary);
      padding: 1.5rem;
    }
    .auth-card {
      width: 100%;
      max-width: 400px;
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 2.5rem;
    }
    .brand { text-align: center; margin-bottom: 2rem; }
    .brand-icon { font-size: 2.5rem; }
    .brand h1 { font-size: 2rem; font-weight: 800; color: var(--accent); margin: 0.25rem 0; letter-spacing: -1px; }
    .brand p { color: var(--text-muted); font-size: 0.875rem; }
    .tabs { display: flex; gap: 0.5rem; margin-bottom: 1.5rem; background: var(--bg-secondary); border-radius: 10px; padding: 4px; }
    .tabs button { flex: 1; padding: 0.5rem; border: none; border-radius: 8px; background: transparent; color: var(--text-muted); font-size: 0.875rem; font-weight: 500; cursor: pointer; transition: all 0.2s; }
    .tabs button.active { background: var(--accent); color: #000; font-weight: 700; }
    .field { margin-bottom: 1rem; }
    .field label { display: block; font-size: 0.8125rem; font-weight: 500; color: var(--text-muted); margin-bottom: 0.375rem; }
    .field input { width: 100%; padding: 0.625rem 0.875rem; background: var(--bg-secondary); border: 1px solid var(--border); border-radius: 8px; color: var(--text-primary); font-size: 0.9375rem; box-sizing: border-box; transition: border-color 0.2s; }
    .field input:focus { outline: none; border-color: var(--accent); box-shadow: 0 0 0 3px rgba(0, 212, 255, 0.1); }
    .btn-primary { width: 100%; padding: 0.75rem; background: var(--accent); color: #000; border: none; border-radius: 10px; font-size: 0.9375rem; font-weight: 700; cursor: pointer; margin-top: 0.5rem; transition: opacity 0.2s; }
    .btn-primary:hover:not(:disabled) { opacity: 0.9; }
    .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
    .divider { text-align: center; margin: 1.25rem 0; color: var(--text-muted); font-size: 0.8125rem; position: relative; }
    .divider::before, .divider::after { content: ''; position: absolute; top: 50%; width: 40%; height: 1px; background: var(--border); }
    .divider::before { left: 0; } .divider::after { right: 0; }
    .divider span { background: var(--bg-card); padding: 0 0.5rem; }
    .btn-google { width: 100%; padding: 0.75rem; background: var(--bg-secondary); border: 1px solid var(--border); border-radius: 10px; color: var(--text-primary); font-size: 0.9375rem; font-weight: 500; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 0.625rem; transition: border-color 0.2s; }
    .btn-google:hover:not(:disabled) { border-color: var(--accent); }
    .error-banner { background: rgba(255, 80, 80, 0.12); border: 1px solid rgba(255, 80, 80, 0.3); color: #ff8080; border-radius: 8px; padding: 0.75rem 1rem; font-size: 0.875rem; margin-bottom: 1rem; }
    .success-banner { background: rgba(0, 212, 100, 0.12); border: 1px solid rgba(0, 212, 100, 0.3); color: #00d464; border-radius: 8px; padding: 0.75rem 1rem; font-size: 0.875rem; margin-bottom: 1rem; }
  `]
})
export class AuthComponent implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  mode = signal<'login' | 'signup'>('login');
  loading = signal(false);
  error = signal('');
  message = signal('');
  email = '';
  password = '';

  ngOnInit() {
    // Handle OAuth callback
    const fragment = window.location.hash;
    if (fragment.includes('access_token')) {
      this.auth.handleOAuthCallback(fragment);
    }
    // Redirect if already logged in
    if (this.auth.isLoggedIn()) {
      this.router.navigate(['/dashboard']);
    }
  }

  submit() {
    this.error.set('');
    this.message.set('');
    this.loading.set(true);

    const action = this.mode() === 'login'
      ? this.auth.login(this.email, this.password)
      : this.auth.signup(this.email, this.password);

    action.subscribe({
      next: (res) => {
        this.loading.set(false);
        if (this.mode() === 'signup' && !res.access_token) {
          this.message.set('Account created! Check your email to confirm, then sign in.');
        } else {
          this.router.navigate(['/dashboard']);
        }
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.error?.error_description || err.error?.msg || 'Authentication failed. Please try again.');
      }
    });
  }

  googleLogin() {
    this.auth.loginWithGoogle();
  }
}
