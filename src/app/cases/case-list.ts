import { DatePipe } from '@angular/common';
import { Component, computed, DestroyRef, effect, inject, input, untracked } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { Message } from 'primeng/message';
import { SelectButton } from 'primeng/selectbutton';
import { TableModule } from 'primeng/table';
import { Tag } from 'primeng/tag';
import { CaseStatus, CaseView } from '../api/models';
import { ModerationApi } from '../api/moderation-api';
import { humanize, severityTone } from '../shared/labels';
import { Pager } from '../shared/pager';

const STATUSES: CaseStatus[] = ['OPEN', 'ACTIONED', 'DISMISSED'];

@Component({
  selector: 'app-case-list',
  imports: [
    DatePipe,
    FormsModule,
    RouterLink,
    ButtonModule,
    Message,
    SelectButton,
    TableModule,
    Tag,
  ],
  templateUrl: './case-list.html',
})
export class CaseListComponent {
  private readonly api = inject(ModerationApi);
  private readonly router = inject(Router);

  readonly status = input<string>();

  protected readonly current = computed<CaseStatus>(() => {
    const status = this.status() as CaseStatus;
    return STATUSES.includes(status) ? status : 'OPEN';
  });
  protected readonly statusOptions = STATUSES.map((value) => ({ label: humanize(value), value }));
  protected readonly pager = new Pager<CaseView>((cursor) =>
    this.api.cases(this.current(), cursor),
  );
  protected readonly humanize = humanize;
  protected readonly severityTone = severityTone;

  constructor() {
    effect(() => {
      this.current();
      untracked(() => this.pager.reset());
    });
    inject(DestroyRef).onDestroy(() => this.pager.dispose());
  }

  protected choose(status: CaseStatus): void {
    void this.router.navigate([], { queryParams: { status }, replaceUrl: true });
  }

  protected open(moderationCase: CaseView): void {
    void this.router.navigate(['/cases', moderationCase.id]);
  }
}
