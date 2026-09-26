import { DatePipe } from '@angular/common';
import { Component, DestroyRef, effect, inject, input, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { Message } from 'primeng/message';
import { TableModule } from 'primeng/table';
import { Tag } from 'primeng/tag';
import { toApiFailure } from '../api/envelope';
import { AuditEntry, CaseView, UserDetail } from '../api/models';
import { ModerationApi } from '../api/moderation-api';
import { UsersApi } from '../api/users-api';
import { AuditTableComponent } from '../audit/audit-table';
import { accountStatusTone, caseStatusTone, humanize } from '../shared/labels';
import { Pager } from '../shared/pager';

@Component({
  selector: 'app-user-detail',
  imports: [DatePipe, RouterLink, ButtonModule, Message, TableModule, Tag, AuditTableComponent],
  templateUrl: './user-detail.html',
})
export class UserDetailComponent {
  private readonly usersApi = inject(UsersApi);
  private readonly moderationApi = inject(ModerationApi);
  private readonly router = inject(Router);

  readonly userId = input.required<string>();

  protected readonly detail = signal<UserDetail | null>(null);
  protected readonly error = signal<string | null>(null);
  protected readonly history = new Pager<AuditEntry>((cursor) =>
    this.moderationApi.auditLog(this.userId(), cursor),
  );
  protected readonly humanize = humanize;
  protected readonly accountTone = accountStatusTone;
  protected readonly caseTone = caseStatusTone;

  constructor() {
    effect((onCleanup) => {
      const userId = this.userId();
      this.detail.set(null);
      this.error.set(null);
      const subscription = this.usersApi.detail(userId).subscribe({
        next: (detail) => this.detail.set(detail),
        error: (error: unknown) => this.error.set(toApiFailure(error).message),
      });
      this.history.reset();
      onCleanup(() => subscription.unsubscribe());
    });
    inject(DestroyRef).onDestroy(() => this.history.dispose());
  }

  protected openCase(moderationCase: CaseView): void {
    void this.router.navigate(['/cases', moderationCase.id]);
  }
}
