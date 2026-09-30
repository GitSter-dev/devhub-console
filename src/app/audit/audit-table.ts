import { DatePipe } from '@angular/common';
import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TableModule } from 'primeng/table';
import { Tag } from 'primeng/tag';
import { AuditEntry } from '../api/models';
import { actionTone, humanize } from '../shared/labels';

@Component({
  selector: 'app-audit-table',
  imports: [DatePipe, RouterLink, TableModule, Tag],
  template: `
    <p-table [value]="entries()" [loading]="loading() && entries().length === 0" dataKey="id">
      <ng-template #header>
        <tr>
          <th>When</th>
          <th>Action</th>
          <th>Moderator</th>
          <th>Against</th>
          <th>Community</th>
          <th>Until</th>
          <th>Note</th>
          <th>Case</th>
        </tr>
      </ng-template>
      <ng-template #body let-entry>
        <tr>
          <td>{{ entry.createdAt | date: 'medium' }}</td>
          <td><p-tag [value]="humanize(entry.action)" [severity]="tone(entry.action)" /></td>
          <td>&#64;{{ entry.moderatorUsername }}</td>
          <td>
            @if (entry.targetUserId) {
              <a [routerLink]="['/users', entry.targetUserId]">&#64;{{ entry.targetUsername }}</a>
            }
          </td>
          <td>
            @if (entry.community; as community) {
              <a [routerLink]="['/cases']" [queryParams]="{ community: community.id }"
                >c/{{ community.slug }}</a
              >
            }
          </td>
          <td>{{ entry.actsUntil ? (entry.actsUntil | date: 'medium') : '' }}</td>
          <td class="note">{{ entry.note }}</td>
          <td>
            @if (entry.caseId) {
              <a [routerLink]="['/cases', entry.caseId]" aria-label="Open case"
                ><i class="pi pi-external-link"></i
              ></a>
            }
          </td>
        </tr>
      </ng-template>
      <ng-template #emptymessage>
        <tr>
          <td colspan="8" class="muted">{{ loading() ? '' : 'No moderation actions yet.' }}</td>
        </tr>
      </ng-template>
    </p-table>
  `,
  styles: `
    .note {
      max-width: 22rem;
      overflow-wrap: anywhere;
    }
  `,
})
export class AuditTableComponent {
  readonly entries = input.required<AuditEntry[]>();
  readonly loading = input(false);

  protected readonly humanize = humanize;
  protected readonly tone = actionTone;
}
