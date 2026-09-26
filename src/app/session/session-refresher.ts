import { HttpBackend, HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom, Subject, throwError, timer } from 'rxjs';
import { retry } from 'rxjs/operators';
import { ApiEnvelope, ApiFailure, toApiFailure, unwrap } from '../api/envelope';
import { TokenPair } from '../api/models';
import { backoff } from '../http/backoff';
import { TokenStorage } from './token-storage';

export const REFRESH_LOCK = 'devhub-console-refresh';

const SESSION_ENDING_CODES = new Set(['SESSION_REPLACED', 'INVALID_REFRESH_TOKEN', 'UNAUTHORIZED']);
const NETWORK_RETRIES = 2;

@Injectable({ providedIn: 'root' })
export class SessionRefresher {
  private readonly http = new HttpClient(inject(HttpBackend));
  private readonly storage = inject(TokenStorage);
  private inflight: Promise<string> | null = null;

  readonly ended = new Subject<string>();

  refresh(rejectedAccessToken: string): Promise<string> {
    this.inflight ??= exclusive(() => this.rotate(rejectedAccessToken)).finally(() => {
      this.inflight = null;
    });
    return this.inflight;
  }

  private async rotate(rejectedAccessToken: string): Promise<string> {
    const stored = this.storage.read();
    if (!stored) {
      this.ended.next('SIGNED_OUT');
      throw new ApiFailure(401, 'SIGNED_OUT', 'You are signed out.');
    }
    if (stored.accessToken !== rejectedAccessToken) {
      return stored.accessToken;
    }
    try {
      const pair = await firstValueFrom(
        this.http
          .post<ApiEnvelope<TokenPair>>(
            '/auth/refresh',
            { refreshToken: stored.refreshToken },
            { headers: { 'Idempotency-Key': crypto.randomUUID() } },
          )
          .pipe(
            retry({
              count: NETWORK_RETRIES,
              delay: (error: unknown, attempt: number) =>
                toApiFailure(error).isNetwork ? timer(backoff(attempt)) : throwError(() => error),
            }),
            unwrap(),
          ),
      );
      this.storage.save(pair);
      return pair.accessToken;
    } catch (error) {
      const failure = toApiFailure(error);
      if (SESSION_ENDING_CODES.has(failure.code)) {
        this.storage.clear();
        this.ended.next(failure.code);
      }
      throw failure;
    }
  }
}

function exclusive<T>(task: () => Promise<T>): Promise<T> {
  const locks = globalThis.navigator?.locks;
  if (!locks) {
    return task();
  }
  return new Promise<T>((resolve, reject) => {
    void locks.request(REFRESH_LOCK, () => task().then(resolve, reject));
  });
}
