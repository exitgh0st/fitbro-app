import { Component, signal, inject, computed } from '@angular/core';
import { httpResource } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { NavComponent } from '../../shared/components/nav/nav.component';
import { environment } from '../../../environments/environment';

type HistoryType = 'workouts' | 'runs' | 'nutrition' | 'weight';

const TABS: { id: HistoryType; label: string; icon: string }[] = [
  { id: 'workouts', label: 'Workouts', icon: '🏋️' },
  { id: 'runs', label: 'Runs', icon: '🏃' },
  { id: 'nutrition', label: 'Nutrition', icon: '🥗' },
  { id: 'weight', label: 'Weight', icon: '⚖️' },
];

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule, NavComponent],
  template: `
    <div class="layout">
      <app-nav />
      <main class="content">
        <header class="page-header">
          <h2>History</h2>
        </header>

        <div class="tabs">
          @for (tab of tabs; track tab.id) {
            <button [class.active]="activeTab() === tab.id" (click)="setTab(tab.id)">
              {{ tab.icon }} {{ tab.label }}
            </button>
          }
        </div>

        <div class="tab-content">
          @if (history.isLoading()) {
            <div class="loading">Loading...</div>
          } @else if (history.error()) {
            <div class="error-state">Failed to load history.</div>
          } @else if (!rows().length) {
            <div class="empty-state">No {{ activeTab() }} logged yet. Ask your AI Coach to log some!</div>
          } @else {
            <div class="rows">
              @for (row of rows(); track $index) {
                <div class="row-card">
                  @if (activeTab() === 'workouts') {
                    <div class="row-title">{{ row.session_name }}</div>
                    <div class="row-meta">{{ row.session_date }} · {{ row.exercise_count }} exercises</div>
                  }
                  @if (activeTab() === 'runs') {
                    <div class="row-title">{{ row.distance_km }} km run</div>
                    <div class="row-meta">{{ row.run_date }} · {{ row.pace_formatted }}/km · {{ row.duration_min }} min</div>
                    @if (row.notes) { <div class="row-note">{{ row.notes }}</div> }
                  }
                  @if (activeTab() === 'nutrition') {
                    <div class="row-title">{{ row.meal_type | titlecase }}</div>
                    <div class="row-meta">{{ row.log_date }} · {{ row.total_calories }} kcal</div>
                    <div class="row-macros">
                      <span>P: {{ row.total_protein_g }}g</span>
                      <span>C: {{ row.total_carbs_g }}g</span>
                      <span>F: {{ row.total_fat_g }}g</span>
                    </div>
                  }
                  @if (activeTab() === 'weight') {
                    <div class="row-title">{{ row.weight_kg }} kg</div>
                    <div class="row-meta">
                      {{ row.logged_date }}
                      @if (row.bmi) { · BMI: {{ row.bmi }} }
                      @if (row.change_kg != null) {
                        · <span [class]="row.change_kg <= 0 ? 'positive' : 'negative'">{{ row.change_kg >= 0 ? '+' : '' }}{{ row.change_kg }} kg</span>
                      }
                    </div>
                  }
                </div>
              }
            </div>
          }
        </div>
      </main>
    </div>
  `,
  styles: [`
    .layout { display: flex; min-height: 100vh; }
    .content { flex: 1; padding: 2rem; overflow-y: auto; }
    .page-header { margin-bottom: 1.5rem; }
    .page-header h2 { font-size: 1.5rem; font-weight: 800; color: var(--text-primary); margin: 0; }
    .tabs { display: flex; gap: 0.375rem; margin-bottom: 1.5rem; flex-wrap: wrap; }
    .tabs button { padding: 0.5rem 1rem; background: var(--bg-card); border: 1px solid var(--border); border-radius: 20px; color: var(--text-muted); font-size: 0.875rem; font-weight: 500; cursor: pointer; transition: all 0.15s; }
    .tabs button.active { background: var(--accent); border-color: var(--accent); color: #000; font-weight: 700; }
    .loading { color: var(--text-muted); padding: 2rem 0; text-align: center; }
    .empty-state { color: var(--text-muted); background: var(--bg-card); border: 1px solid var(--border); border-radius: 12px; padding: 2.5rem; text-align: center; }
    .error-state { color: #ff8080; background: rgba(255,80,80,0.1); border: 1px solid rgba(255,80,80,0.2); border-radius: 10px; padding: 1rem 1.25rem; }
    .rows { display: flex; flex-direction: column; gap: 0.75rem; }
    .row-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: 12px; padding: 1rem 1.25rem; transition: border-color 0.15s; }
    .row-card:hover { border-color: rgba(0,212,255,0.4); }
    .row-title { font-size: 1rem; font-weight: 700; color: var(--text-primary); margin-bottom: 0.25rem; }
    .row-meta { font-size: 0.8125rem; color: var(--text-muted); }
    .row-note { font-size: 0.8125rem; color: var(--text-muted); margin-top: 0.25rem; font-style: italic; }
    .row-macros { display: flex; gap: 0.75rem; margin-top: 0.375rem; }
    .row-macros span { font-size: 0.8125rem; color: var(--accent); font-weight: 600; }
    .positive { color: #4ade80; }
    .negative { color: #f87171; }
  `]
})
export class HistoryComponent {
  readonly tabs = TABS;
  readonly activeTab = signal<HistoryType>('workouts');

  readonly history = httpResource(() => ({
    url: `${environment.n8nBaseUrl}/webhook/fitbro-history?type=${this.activeTab()}`,
    method: 'GET' as const,
  }));

  readonly rows = computed(() => (this.history.value() as any)?.data ?? []);

  setTab(tab: HistoryType) {
    this.activeTab.set(tab);
  }
}
