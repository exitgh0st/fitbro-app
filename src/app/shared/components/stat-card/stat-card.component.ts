import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="stat-card">
      <div class="stat-header">
        <span class="stat-label">{{ label() }}</span>
        <span class="stat-icon">{{ icon() }}</span>
      </div>
      <div class="stat-value">{{ value() }}</div>
      @if (sub()) {
        <div class="stat-sub">{{ sub() }}</div>
      }
    </div>
  `,
  styles: [`
    .stat-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: 14px; padding: 1.25rem 1.5rem; transition: border-color 0.2s, box-shadow 0.2s; cursor: default; }
    .stat-card:hover { border-color: var(--accent); box-shadow: 0 0 20px rgba(0, 212, 255, 0.08); }
    .stat-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.75rem; }
    .stat-label { font-size: 0.8125rem; font-weight: 500; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; }
    .stat-icon { font-size: 1.25rem; }
    .stat-value { font-size: 1.75rem; font-weight: 800; color: var(--text-primary); line-height: 1.1; letter-spacing: -0.5px; }
    .stat-sub { font-size: 0.8125rem; color: var(--text-muted); margin-top: 0.375rem; }
  `]
})
export class StatCardComponent {
  label = input.required<string>();
  value = input.required<string>();
  icon = input<string>('');
  sub = input<string>('');
}
