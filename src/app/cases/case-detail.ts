import { DatePipe } from '@angular/common';
import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { InputNumber } from 'primeng/inputnumber';
import { Message } from 'primeng/message';
import { Select } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { Tag } from 'primeng/tag';
import { Subscription } from 'rxjs';
import { Textarea } from 'primeng/textarea';
import { toApiFailure } from '../api/envelope';
import { CaseDetail, ModerationActionType } from '../api/models';
import { ModerationApi } from '../api/moderation-api';
import { actionTone, caseStatusTone, humanize, severityTone } from '../shared/labels';
import {
  actionProblem,
  actionRequest,
  availableActions,
  MAX_NOTE_LENGTH,
  MAX_SUSPENSION_DAYS,
} from './case-actions';
import { SnapshotViewComponent } from './snapshot-view';

@Component({
  selector: 'app-case-detail',
  imports: [
    DatePipe,
    ReactiveFormsModule,
    RouterLink,
    ButtonModule,
    InputNumber,
    Message,
    Select,
    TableModule,
    Tag,
    Textarea,
    SnapshotViewComponent,
  ],
  templateUrl: './case-detail.html',
  styleUrl: './case-detail.scss',
})
export class CaseDetailComponent {
  private readonly api = inject(ModerationApi);
  private readonly confirmation = inject(ConfirmationService);
  private readonly messages = inject(MessageService);
  private readonly fb = inject(NonNullableFormBuilder);

  readonly caseId = input.required<string>();

  protected readonly detail = signal<CaseDetail | null>(null);
  protected readonly loadError = signal<string | null>(null);
  protected readonly actionError = signal<string | null>(null);
  protected readonly acting = signal(false);

  protected readonly form = this.fb.group({
    action: this.fb.control<ModerationActionType | null>(null, Validators.required),
    days: this.fb.control<number | null>(7),
    note: ['', Validators.maxLength(MAX_NOTE_LENGTH)],
  });
  protected readonly options = computed(() => {
    const detail = this.detail();
    return detail ? availableActions(detail.moderationCase.targetType) : [];
  });
  protected readonly chosen = toSignal(this.form.controls.action.valueChanges, {
    initialValue: null,
  });
  protected readonly chosenOption = computed(() =>
    this.options().find((option) => option.action === this.chosen()),
  );

  protected readonly maxDays = MAX_SUSPENSION_DAYS;
  protected readonly maxNote = MAX_NOTE_LENGTH;
  protected readonly humanize = humanize;
  protected readonly severityTone = severityTone;
  protected readonly caseTone = caseStatusTone;
  protected readonly actionTone = actionTone;

  constructor() {
    effect((onCleanup) => {
      const subscription = this.load(this.caseId());
      onCleanup(() => subscription.unsubscribe());
    });
  }

  protected submit(): void {
    const detail = this.detail();
    const { action, days, note } = this.form.getRawValue();
    const problem = actionProblem(action, days);
    if (!detail || !action || problem || this.form.invalid) {
      this.actionError.set(problem ?? `A note is at most ${MAX_NOTE_LENGTH} characters.`);
      return;
    }
    const option = this.chosenOption();
    this.confirmation.confirm({
      header: `${option?.label ?? humanize(action)}?`,
      message: `${option?.description ?? ''} This is written to the audit log.`,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: option?.label ?? 'Confirm',
      rejectLabel: 'Cancel',
      acceptButtonProps: { severity: actionTone(action) === 'danger' ? 'danger' : 'primary' },
      rejectButtonProps: { severity: 'secondary', text: true },
      accept: () => this.act(detail.moderationCase.id, action, note, days),
    });
  }

  private act(
    caseId: string,
    action: ModerationActionType,
    note: string,
    days: number | null,
  ): void {
    this.acting.set(true);
    this.actionError.set(null);
    this.api.act(caseId, actionRequest(action, note, days)).subscribe({
      next: (detail) => {
        this.detail.set(detail);
        this.acting.set(false);
        this.form.reset({ action: null, days: 7, note: '' });
        this.messages.add({ severity: 'success', summary: `${humanize(action)} recorded` });
      },
      error: (error: unknown) => {
        this.actionError.set(toApiFailure(error).message);
        this.acting.set(false);
      },
    });
  }

  private load(caseId: string): Subscription {
    this.detail.set(null);
    this.loadError.set(null);
    return this.api.caseDetail(caseId).subscribe({
      next: (detail) => this.detail.set(detail),
      error: (error: unknown) => this.loadError.set(toApiFailure(error).message),
    });
  }
}
