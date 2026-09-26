import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { ApiEnvelope, unwrap } from './envelope';
import { query } from './query';
import { UserDetail, UserSummary } from './models';

@Injectable({ providedIn: 'root' })
export class UsersApi {
  private readonly http = inject(HttpClient);

  search(q: string) {
    return this.http
      .get<ApiEnvelope<UserSummary[]>>('/admin/users', { params: query({ q }) })
      .pipe(unwrap());
  }

  detail(userId: string) {
    return this.http.get<ApiEnvelope<UserDetail>>(`/admin/users/${userId}`).pipe(unwrap());
  }
}
