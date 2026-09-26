import { DatePipe } from '@angular/common';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ChartModule } from 'primeng/chart';
import { Message } from 'primeng/message';
import { SelectButton } from 'primeng/selectbutton';
import { toApiFailure } from '../api/envelope';
import { StatsOverview } from '../api/models';
import { StatsApi } from '../api/stats-api';
import { ThemeService } from '../layout/theme';
import { resolveColor } from '../shared/resolve-color';

const RANGES = [7, 30, 90];

const SERIES = [
  { key: 'signups', label: 'Signups', token: '--p-primary-500' },
  { key: 'posts', label: 'Posts', token: '--p-sky-500' },
  { key: 'reports', label: 'Reports', token: '--p-amber-500' },
  { key: 'actions', label: 'Moderation actions', token: '--p-red-500' },
] as const;

@Component({
  selector: 'app-stats-overview',
  imports: [DatePipe, FormsModule, ChartModule, Message, SelectButton],
  templateUrl: './overview.html',
  styleUrl: './overview.scss',
})
export class StatsOverviewComponent {
  private readonly api = inject(StatsApi);
  private readonly theme = inject(ThemeService);

  protected readonly ranges = RANGES.map((days) => ({ label: `${days} days`, value: days }));
  protected readonly days = signal(30);
  protected readonly overview = signal<StatsOverview | null>(null);
  protected readonly error = signal<string | null>(null);

  protected readonly tiles = computed(() => {
    const totals = this.overview()?.totals;
    return totals
      ? [
          { label: 'Accounts', value: totals.users },
          { label: 'Verified', value: totals.verifiedUsers },
          { label: 'Live posts', value: totals.posts },
          { label: 'Open cases', value: totals.openCases, alert: totals.openCases > 0 },
          { label: 'Suspended now', value: totals.suspended },
          { label: 'Banned', value: totals.banned },
        ]
      : [];
  });

  protected readonly chartData = computed(() => {
    const daily = this.overview()?.daily ?? [];
    this.theme.dark();
    return {
      labels: daily.map((day) => day.date),
      datasets: SERIES.map((series) => {
        const color = resolveColor(series.token);
        return {
          label: series.label,
          data: daily.map((day) => day[series.key]),
          borderColor: color,
          backgroundColor: color,
          cubicInterpolationMode: 'monotone',
          pointRadius: daily.length > 31 ? 0 : 3,
        };
      }),
    };
  });

  protected readonly chartOptions = computed(() => {
    this.theme.dark();
    const text = resolveColor('--p-text-muted-color');
    const grid = resolveColor('--p-content-border-color');
    return {
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: { legend: { labels: { color: text } } },
      scales: {
        x: { ticks: { color: text, maxTicksLimit: 10 }, grid: { color: grid } },
        y: { beginAtZero: true, ticks: { color: text, precision: 0 }, grid: { color: grid } },
      },
    };
  });

  constructor() {
    effect((onCleanup) => {
      const days = this.days();
      this.error.set(null);
      const subscription = this.api.overview(days).subscribe({
        next: (overview) => this.overview.set(overview),
        error: (error: unknown) => this.error.set(toApiFailure(error).message),
      });
      onCleanup(() => subscription.unsubscribe());
    });
  }
}
