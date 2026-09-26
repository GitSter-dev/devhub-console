import { signal } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { toApiFailure } from '../api/envelope';

export interface Page<T> {
  items: T[];
  nextCursor: string | null;
}

export class Pager<T> {
  readonly items = signal<T[]>([]);
  readonly nextCursor = signal<string | null>(null);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  private subscription?: Subscription;

  constructor(private readonly fetch: (cursor: string | null) => Observable<Page<T>>) {}

  reset(): void {
    this.load(null);
  }

  more(): void {
    const cursor = this.nextCursor();
    if (cursor && !this.loading()) {
      this.load(cursor);
    }
  }

  dispose(): void {
    this.subscription?.unsubscribe();
  }

  private load(cursor: string | null): void {
    this.subscription?.unsubscribe();
    this.loading.set(true);
    this.error.set(null);
    if (!cursor) {
      this.items.set([]);
      this.nextCursor.set(null);
    }
    this.subscription = this.fetch(cursor).subscribe({
      next: (page) => {
        this.items.update((items) => (cursor ? [...items, ...page.items] : page.items));
        this.nextCursor.set(page.nextCursor);
        this.loading.set(false);
      },
      error: (error: unknown) => {
        this.error.set(toApiFailure(error).message);
        this.loading.set(false);
      },
    });
  }
}
