import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router, UrlTree } from '@angular/router';
import { adminGuard, guestGuard } from '../auth/guards';
import { TokenPair } from '../api/models';
import { NOT_ADMIN, SessionStore } from './session-store';
import { TokenStorage } from './token-storage';

const tokens: TokenPair = {
  tokenType: 'Bearer',
  accessToken: 'access',
  accessTokenExpiresAt: '2026-01-01T00:00:00Z',
  refreshToken: 'refresh',
  refreshTokenExpiresAt: '2026-02-01T00:00:00Z',
};

function me(role: 'USER' | 'ADMIN') {
  return {
    success: true,
    data: { id: '1', username: 'root', displayName: 'Root', email: 'r@dev.io', role },
    timestamp: '',
  };
}

async function flushLogin(http: HttpTestingController, role: 'USER' | 'ADMIN'): Promise<void> {
  http.expectOne('/auth/login').flush({ success: true, data: tokens, timestamp: '' });
  await Promise.resolve();
  await new Promise((resolve) => setTimeout(resolve));
  http.expectOne('/users/me').flush(me(role));
}

describe('SessionStore and guards', () => {
  let store: InstanceType<typeof SessionStore>;
  let http: HttpTestingController;

  const guard = (fn: typeof adminGuard) =>
    TestBed.runInInjectionContext(() => fn({} as never, { url: '/audit' } as never));

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    });
    store = TestBed.inject(SessionStore);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('sends a signed-out visitor to the login page and remembers where they were going', () => {
    const result = guard(adminGuard) as UrlTree;

    expect(TestBed.inject(Router).serializeUrl(result)).toBe('/login?returnUrl=%2Faudit');
    expect(guard(guestGuard)).toBe(true);
  });

  it('signs an administrator in', async () => {
    const login = store.login('root', 'secret');
    await flushLogin(http, 'ADMIN');
    await login;

    expect(store.signedIn()).toBe(true);
    expect(store.user()?.username).toBe('root');
    expect(guard(adminGuard)).toBe(true);
  });

  it('refuses an account that is not an administrator and ends its session', async () => {
    const login = store.login('ada', 'secret');
    await flushLogin(http, 'USER');

    await expect(login).rejects.toMatchObject({ code: NOT_ADMIN });
    http.expectOne('/auth/logout').flush({ success: true, timestamp: '' });
    expect(store.signedIn()).toBe(false);
    expect(TestBed.inject(TokenStorage).read()).toBeNull();
  });
});
