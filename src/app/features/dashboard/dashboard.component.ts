import { Component, inject, computed } from '@angular/core';
import { httpResource } from '@angular/core/rxjs-interop';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { NavComponent } from '../../shared/components/nav/nav.component';
import { StatCardComponent } from '../../shared/components/stat-card/stat-card.component';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, NavComponent, StatCardComponent],
  template: `
    <div class="layout">
      <app-nav />
      <main class="content">
        <header class="page-header">
          <h2>Dashboard</h2>
          <span class="date-badge">{{ today }}</span>
        </header>

        @if (dashboard.isLoading()) {
          <div class="loading-grid">
            @for (i of [1,2,3,4]; track i) {
              <div class="skeleton-card"></div>
            }
          </div>
        } @else if (dashboard.error()) {
          <div class="error-state">Failed to load dashboard data. Please try again.</div>
        } @else {
          <div class="stats-grid">
            <app-stat-card
              label="Latest Weight"
              [value]="weightValue()"
              icon="⚖️"
              [sub]="weightSub()"
            />
            <app-stat-card
              label="Last Workout"
              [value]="workoutValue()"
              icon="🏋️"
              [sub]="workoutSub()"
            />
            <app-stat-card
              label="Last Run"
              [value]="runValue()"
              icon="🏃"
              [sub]="runSub()"
            />
            <app-stat-card
              label="Today's Calories"
              [value]="caloriesValue()"
              icon="🔥"
              [sub]="caloriesSub()"
            />
          </div>
        }

        <div class="quick-actions">
          <h3>Quick Actions</h3>
          <div class="action-chips">
            <a href="/chat" class="chip">💬 Chat with AI Coach</a>
            <a href="/history" class="chip">📊 View History</a>
          </div>
        </div>
      </main>
    </div>
  `,
  styles: [`
    .layout { display: flex; min-height: 100vh; }
    .content { flex: 1; padding: 2rem; overflow-y: auto; }
    .page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 2rem; }
    .page-header h2 { font-size: 1.5rem; font-weight: 800; color: var(--text-primary); margin: 0; }
    .date-badge { background: var(--bg-secondary); border: 1px solid var(--border); border-radius: 20px; padding: 0.25rem 0.75rem; font-size: 0.8125rem; color: var(--text-muted); }
    .stats-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 1rem; margin-bottom: 2rem; }
    .loading-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 1rem; margin-bottom: 2rem; }
    .skeleton-card { height: 110px; background: var(--bg-card); border: 1px solid var(--border); border-radius: 14px; animation: pulse 1.5s infinite; }
    @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.5; } }
    .error-state { color: #ff8080; background: rgba(255,80,80,0.1); border: 1px solid rgba(255,80,80,0.2); border-radius: 10px; padding: 1rem 1.25rem; }
    .quick-actions h3 { font-size: 1rem; font-weight: 700; color: var(--text-primary); margin-bottom: 0.75rem; }
    .action-chips { display: flex; gap: 0.75rem; flex-wrap: wrap; }
    .chip { display: inline-flex; align-items: center; gap: 0.375rem; padding: 0.5rem 1rem; background: var(--bg-card); border: 1px solid var(--border); border-radius: 20px; color: var(--text-primary); text-decoration: none; font-size: 0.875rem; font-weight: 500; transition: all 0.15s; }
    .chip:hover { border-color: var(--accent); color: var(--accent); }
  `]
})
export class DashboardComponent {
  private readonly http = inject(HttpClient);

  readonly today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  readonly dashboard = httpResource(() => ({
    url: `${environment.n8nBaseUrl}/webhook/fitbro-dashboard`,
    method: 'GET' as const,
  }));

  readonly weightValue = computed(() => {
    const d = this.dashboard.value() as any;
    return d?.latestWeight?.weight_kg != null ? `${d.latestWeight.weight_kg} kg` : '—';
  });
  readonly weightSub = computed(() => {
    const d = this.dashboard.value() as any;
    const change = d?.latestWeight?.change_kg;
    if (change == null) return '';
    return `${change >= 0 ? '+' : ''}${change} kg from last log`;
  });

  readonly workoutValue = computed(() => {
    const d = this.dashboard.value() as any;
    return d?.lastWorkout?.session_name ?? '—';
  });
  readonly workoutSub = computed(() => {
    const d = this.dashboard.value() as any;
    const w = d?.lastWorkout;
    if (!w?.session_date) return '';
    return `${w.session_date} · ${w.exercise_count ?? 0} exercises`;
  });

  readonly runValue = computed(() => {
    const d = this.dashboard.value() as any;
    const r = d?.lastRun;
    return r?.distance_km != null ? `${r.distance_km} km` : '—';
  });
  readonly runSub = computed(() => {
    const d = this.dashboard.value() as any;
    const r = d?.lastRun;
    if (!r?.run_date) return '';
    return `${r.run_date} · ${r.pace_formatted ?? ''} /km`;
  });

  readonly caloriesValue = computed(() => {
    const d = this.dashboard.value() as any;
    const c = d?.todayCalories?.total_calories;
    return c != null ? `${c} kcal` : '—';
  });
  readonly caloriesSub = computed(() => {
    const d = this.dashboard.value() as any;
    const p = d?.todayCalories?.total_protein_g;
    return p != null ? `${p}g protein today` : 'No meals logged yet';
  });
}
