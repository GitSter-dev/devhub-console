import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { ApiEnvelope, unwrap } from './envelope';
import { query } from './query';
import { StatsOverview } from './models';

@Injectable({ providedIn: 'root' })
export class StatsApi {
  private readonly http = inject(HttpClient);

  overview(days: number) {
    return this.http
      .get<ApiEnvelope<StatsOverview>>('/admin/stats', { params: query({ days }) })
      .pipe(unwrap());
  }
}
