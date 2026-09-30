import { DatePipe } from '@angular/common';
import {
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  input,
  signal,
  untracked,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AutoComplete, AutoCompleteCompleteEvent } from 'primeng/autocomplete';
import { ButtonModule } from 'primeng/button';
import { Chip } from 'primeng/chip';
import { Message } from 'primeng/message';
import { SelectButton } from 'primeng/selectbutton';
import { TableModule } from 'primeng/table';
import { Tag } from 'primeng/tag';
import { CommunitiesApi } from '../api/communities-api';
import { CaseCommunity, CaseStatus, CaseView, CommunitySummary } from '../api/models';
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
    AutoComplete,
    ButtonModule,
    Chip,
    Message,
    SelectButton,
    TableModule,
    Tag,
  ],
  templateUrl: './case-list.html',
})
export class CaseListComponent {
  private readonly api = inject(ModerationApi);
  private readonly communities = inject(CommunitiesApi);
  private readonly router = inject(Router);

  readonly status = input<string>();
  readonly community = input<string>();

  protected readonly current = computed<CaseStatus>(() => {
    const status = this.status() as CaseStatus;
    return STATUSES.includes(status) ? status : 'OPEN';
  });
  protected readonly communityId = computed(() => this.community() || null);
  private readonly chosen = signal<CaseCommunity | CommunitySummary | null>(null);
  protected readonly communityLabel = computed(() => {
    const chosen = this.chosen();
    const named = chosen?.id === this.communityId() ? chosen?.name : null;
    return named ?? this.pager.items()[0]?.community?.name ?? 'Selected community';
  });
  protected readonly suggestions = signal<CommunitySummary[]>([]);
  protected readonly statusOptions = STATUSES.map((value) => ({ label: humanize(value), value }));
  protected readonly pager = new Pager<CaseView>((cursor) =>
    this.api.cases(this.current(), this.communityId(), cursor),
  );
  protected readonly humanize = humanize;
  protected readonly severityTone = severityTone;

  constructor() {
    effect(() => {
      this.current();
      this.communityId();
      untracked(() => this.pager.reset());
    });
    inject(DestroyRef).onDestroy(() => this.pager.dispose());
  }

  protected choose(status: CaseStatus): void {
    this.navigate({ status });
  }

  protected searchCommunities(event: AutoCompleteCompleteEvent): void {
    this.communities.search(event.query).subscribe({
      next: (found) => this.suggestions.set(found),
      error: () => this.suggestions.set([]),
    });
  }

  protected filterBy(community: CaseCommunity | CommunitySummary): void {
    this.chosen.set(community);
    this.navigate({ community: community.id });
  }

  protected clearCommunity(): void {
    this.chosen.set(null);
    this.navigate({ community: null });
  }

  protected open(moderationCase: CaseView): void {
    void this.router.navigate(['/cases', moderationCase.id]);
  }

  private navigate(queryParams: Record<string, string | null>): void {
    void this.router.navigate([], { queryParams, queryParamsHandling: 'merge', replaceUrl: true });
  }
}
