import { Component, DestroyRef, inject } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { Message } from 'primeng/message';
import { AuditEntry } from '../api/models';
import { ModerationApi } from '../api/moderation-api';
import { Pager } from '../shared/pager';
import { AuditTableComponent } from './audit-table';

@Component({
  selector: 'app-audit-log',
  imports: [ButtonModule, Message, AuditTableComponent],
  template: `
    <div class="page-header">
      <h1>Audit log</h1>
      <p-button
        icon="pi pi-refresh"
        label="Refresh"
        [text]="true"
        [loading]="pager.loading()"
        (onClick)="pager.reset()"
      />
    </div>
    @if (pager.error(); as error) {
      <p-message severity="error">{{ error }}</p-message>
    }
    <div class="panel">
      <app-audit-table [entries]="pager.items()" [loading]="pager.loading()" />
      @if (pager.nextCursor()) {
        <div class="load-more">
          <p-button
            label="Load more"
            [text]="true"
            [loading]="pager.loading()"
            (onClick)="pager.more()"
          />
        </div>
      }
    </div>
  `,
})
export class AuditLogComponent {
  private readonly api = inject(ModerationApi);
  protected readonly pager = new Pager<AuditEntry>((cursor) => this.api.auditLog(null, cursor));

  constructor() {
    this.pager.reset();
    inject(DestroyRef).onDestroy(() => this.pager.dispose());
  }
}
