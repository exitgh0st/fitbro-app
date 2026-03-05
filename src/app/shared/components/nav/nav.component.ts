import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/auth.service';

@Component({
  selector: 'app-nav',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <nav class="sidebar">
      <div class="sidebar-brand">
        <span class="brand-icon">⚡</span>
        <span class="brand-name">FitBro</span>
      </div>
      <div class="nav-links">
        <a routerLink="/dashboard" routerLinkActive="active">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
          Dashboard
        </a>
        <a routerLink="/chat" routerLinkActive="active">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          AI Coach
        </a>
        <a routerLink="/history" routerLinkActive="active">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22,12 18,12 15,21 9,3 6,12 2,12"/></svg>
          History
        </a>
      </div>
      <div class="nav-footer">
        <div class="user-info">
          <div class="user-avatar">{{ userInitial() }}</div>
          <span class="user-email">{{ auth.user()?.email }}</span>
        </div>
        <button class="logout-btn" (click)="auth.logout()">Sign Out</button>
      </div>
    </nav>
  `,
  styles: [`
    .sidebar { display: flex; flex-direction: column; width: 220px; min-height: 100vh; background: var(--bg-card); border-right: 1px solid var(--border); padding: 1.5rem 1rem; flex-shrink: 0; }
    .sidebar-brand { display: flex; align-items: center; gap: 0.5rem; padding: 0 0.5rem; margin-bottom: 2rem; }
    .brand-icon { font-size: 1.5rem; }
    .brand-name { font-size: 1.25rem; font-weight: 800; color: var(--accent); letter-spacing: -0.5px; }
    .nav-links { display: flex; flex-direction: column; gap: 0.25rem; flex: 1; }
    .nav-links a { display: flex; align-items: center; gap: 0.625rem; padding: 0.625rem 0.75rem; border-radius: 10px; color: var(--text-muted); text-decoration: none; font-size: 0.9375rem; font-weight: 500; transition: all 0.15s; }
    .nav-links a:hover { color: var(--text-primary); background: var(--bg-secondary); }
    .nav-links a.active { color: var(--accent); background: rgba(0, 212, 255, 0.1); }
    .nav-footer { border-top: 1px solid var(--border); padding-top: 1rem; margin-top: 1rem; }
    .user-info { display: flex; align-items: center; gap: 0.625rem; margin-bottom: 0.75rem; }
    .user-avatar { width: 32px; height: 32px; background: var(--accent); color: #000; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.875rem; flex-shrink: 0; }
    .user-email { font-size: 0.8125rem; color: var(--text-muted); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .logout-btn { width: 100%; padding: 0.5rem; background: transparent; border: 1px solid var(--border); border-radius: 8px; color: var(--text-muted); font-size: 0.8125rem; cursor: pointer; transition: all 0.15s; }
    .logout-btn:hover { border-color: #ff8080; color: #ff8080; }
  `]
})
export class NavComponent {
  readonly auth = inject(AuthService);
  userInitial() {
    const email = this.auth.user()?.email ?? '';
    return email.charAt(0).toUpperCase() || '?';
  }
}
