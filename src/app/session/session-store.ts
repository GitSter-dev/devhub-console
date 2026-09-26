import { computed, effect, inject, untracked } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import {
  patchState,
  signalStore,
  withComputed,
  withHooks,
  withMethods,
  withState,
} from '@ngrx/signals';
import { firstValueFrom } from 'rxjs';
import { AuthApi } from '../api/auth-api';
import { ApiFailure, toApiFailure } from '../api/envelope';
import { CurrentUser } from '../api/models';
import { SessionRefresher } from './session-refresher';
import { TokenStorage } from './token-storage';

export type SessionStatus = 'signedOut' | 'signedIn' | 'reauthRequired';

interface SessionState {
  status: SessionStatus;
  user: CurrentUser | null;
  reason: string | null;
}

export const NOT_ADMIN = 'NOT_ADMIN';

export const SessionStore = signalStore(
  { providedIn: 'root' },
  withState<SessionState>({ status: 'signedOut', user: null, reason: null }),
  withComputed((store) => ({
    signedIn: computed(() => store.status() === 'signedIn'),
  })),
  withMethods(
    (store, api = inject(AuthApi), storage = inject(TokenStorage), router = inject(Router)) => {
      const discard = () => {
        const pair = storage.read();
        storage.clear();
        if (pair) {
          api.logout(pair.refreshToken).subscribe({ error: () => undefined });
        }
      };
      return {
        async restore(): Promise<void> {
          if (!storage.read()) {
            return;
          }
          try {
            const user = await firstValueFrom(api.me());
            if (user.role !== 'ADMIN') {
              discard();
              return;
            }
            patchState(store, { status: 'signedIn', user, reason: null });
          } catch (error) {
            const failure = toApiFailure(error);
            if (!failure.isNetwork) {
              storage.clear();
            }
          }
        },
        async login(identifier: string, password: string): Promise<void> {
          storage.save(await firstValueFrom(api.login(identifier, password)));
          const user = await firstValueFrom(api.me());
          if (user.role !== 'ADMIN') {
            discard();
            throw new ApiFailure(403, NOT_ADMIN, 'This account is not a moderator account.');
          }
          patchState(store, { status: 'signedIn', user, reason: null });
        },
        logout(): void {
          discard();
          patchState(store, { status: 'signedOut', user: null, reason: null });
          void router.navigate(['/login']);
        },
        end(reason: string): void {
          storage.clear();
          if (store.status() === 'signedIn') {
            patchState(store, { status: 'reauthRequired', user: null, reason });
            void router.navigate(['/login']);
          }
        },
      };
    },
  ),
  withHooks({
    onInit(store) {
      const storage = inject(TokenStorage);
      inject(SessionRefresher)
        .ended.pipe(takeUntilDestroyed())
        .subscribe((reason) => store.end(reason));
      effect(() => {
        if (storage.pair() === null && untracked(() => store.status()) === 'signedIn') {
          store.end('SIGNED_OUT_ELSEWHERE');
        }
      });
    },
  }),
);
