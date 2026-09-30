import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { ApiEnvelope, unwrap } from './envelope';
import { query } from './query';
import { AuditPage, CaseDetail, CasePage, CaseStatus, ModerationActionRequest } from './models';

@Injectable({ providedIn: 'root' })
export class ModerationApi {
  private readonly http = inject(HttpClient);

  cases(status: CaseStatus, communityId: string | null, cursor: string | null) {
    return this.http
      .get<ApiEnvelope<CasePage>>('/admin/moderation/cases', {
        params: query({ status, communityId, cursor }),
      })
      .pipe(unwrap());
  }

  caseDetail(caseId: string) {
    return this.http
      .get<ApiEnvelope<CaseDetail>>(`/admin/moderation/cases/${caseId}`)
      .pipe(unwrap());
  }

  act(caseId: string, request: ModerationActionRequest) {
    return this.http
      .post<ApiEnvelope<CaseDetail>>(`/admin/moderation/cases/${caseId}/actions`, request)
      .pipe(unwrap());
  }

  auditLog(userId: string | null, cursor: string | null) {
    return this.http
      .get<ApiEnvelope<AuditPage>>('/admin/moderation/actions', {
        params: query({ userId, cursor }),
      })
      .pipe(unwrap());
  }
}
