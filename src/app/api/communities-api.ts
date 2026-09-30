import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { ApiEnvelope, unwrap } from './envelope';
import { query } from './query';
import { CommunitySummary } from './models';

const SUGGESTION_LIMIT = 10;

@Injectable({ providedIn: 'root' })
export class CommunitiesApi {
  private readonly http = inject(HttpClient);

  search(q: string) {
    return this.http
      .get<ApiEnvelope<CommunitySummary[]>>('/communities', {
        params: query({ q, limit: SUGGESTION_LIMIT }),
      })
      .pipe(unwrap());
  }
}
