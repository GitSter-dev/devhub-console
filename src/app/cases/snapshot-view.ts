import { DatePipe } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { ReportTarget } from '../api/models';
import { parseSnapshot } from './snapshot';

@Component({
  selector: 'app-snapshot-view',
  imports: [DatePipe],
  templateUrl: './snapshot-view.html',
  styleUrl: './snapshot-view.scss',
})
export class SnapshotViewComponent {
  readonly target = input.required<ReportTarget>();
  readonly raw = input.required<string>();

  protected readonly snapshot = computed(() => parseSnapshot(this.target(), this.raw()));
}
