import { DatePipe } from '@angular/common';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { InputText } from 'primeng/inputtext';
import { Message } from 'primeng/message';
import { TableModule } from 'primeng/table';
import { Tag } from 'primeng/tag';
import { catchError, debounceTime, distinctUntilChanged, map, of, switchMap, tap } from 'rxjs';
import { toApiFailure } from '../api/envelope';
import { UserSummary } from '../api/models';
import { UsersApi } from '../api/users-api';
import { accountStatusTone, humanize } from '../shared/labels';

const MIN_QUERY_LENGTH = 2;
const DEBOUNCE_MS = 300;

@Component({
  selector: 'app-user-search',
  imports: [
    DatePipe,
    ReactiveFormsModule,
    IconField,
    InputIcon,
    InputText,
    Message,
    TableModule,
    Tag,
  ],
  templateUrl: './user-search.html',
})
export class UserSearchComponent {
  private readonly api = inject(UsersApi);
  private readonly router = inject(Router);

  protected readonly query = new FormControl('', { nonNullable: true });
  protected readonly results = signal<UserSummary[]>([]);
  protected readonly searching = signal(false);
  protected readonly searched = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly humanize = humanize;
  protected readonly tone = accountStatusTone;

  constructor() {
    this.query.valueChanges
      .pipe(
        map((value) => value.trim()),
        debounceTime(DEBOUNCE_MS),
        distinctUntilChanged(),
        tap(() => this.error.set(null)),
        switchMap((q) => {
          if (q.length < MIN_QUERY_LENGTH) {
            this.searched.set(false);
            return of([]);
          }
          this.searching.set(true);
          return this.api.search(q).pipe(
            tap(() => this.searched.set(true)),
            catchError((error: unknown) => {
              this.error.set(toApiFailure(error).message);
              return of([]);
            }),
          );
        }),
        takeUntilDestroyed(inject(DestroyRef)),
      )
      .subscribe((results) => {
        this.results.set(results);
        this.searching.set(false);
      });
  }

  protected open(user: UserSummary): void {
    void this.router.navigate(['/users', user.id]);
  }
}
