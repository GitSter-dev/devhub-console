import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { TokenPair } from '../api/models';
import { SessionRefresher } from './session-refresher';
import { TokenStorage } from './token-storage';

function pair(name: string): TokenPair {
  return {
    tokenType: 'Bearer',
    accessToken: `${name}-access`,
    accessTokenExpiresAt: '2026-01-01T00:00:00Z',
    refreshToken: `${name}-refresh`,
    refreshTokenExpiresAt: '2026-02-01T00:00:00Z',
  };
}

describe('SessionRefresher', () => {
  let refresher: SessionRefresher;
  let storage: TokenStorage;
  let http: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    refresher = TestBed.inject(SessionRefresher);
    storage = TestBed.inject(TokenStorage);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('refreshes once for concurrent rejections and hands everyone the new token', async () => {
    storage.save(pair('a'));

    const first = refresher.refresh('a-access');
    const second = refresher.refresh('a-access');

    const request = http.expectOne('/auth/refresh');
    expect(request.request.body).toEqual({ refreshToken: 'a-refresh' });
    expect(request.request.headers.get('Idempotency-Key')).toBeTruthy();
    request.flush({ success: true, data: pair('b'), timestamp: '' });

    await expect(first).resolves.toBe('b-access');
    await expect(second).resolves.toBe('b-access');
    expect(storage.read()?.refreshToken).toBe('b-refresh');
  });

  it('adopts a token another tab already rotated instead of reusing the old refresh token', async () => {
    storage.save(pair('b'));

    await expect(refresher.refresh('a-access')).resolves.toBe('b-access');
  });

  it('ends the session when the server says it was replaced', async () => {
    storage.save(pair('a'));
    const ended: string[] = [];
    refresher.ended.subscribe((reason) => ended.push(reason));

    const result = refresher.refresh('a-access');
    http
      .expectOne('/auth/refresh')
      .flush(
        { success: false, error: { code: 'SESSION_REPLACED', message: 'Replaced' }, timestamp: '' },
        { status: 401, statusText: 'Unauthorized' },
      );

    await expect(result).rejects.toMatchObject({ code: 'SESSION_REPLACED' });
    expect(ended).toEqual(['SESSION_REPLACED']);
    expect(storage.read()).toBeNull();
  });

  it('keeps the session when the refresh fails for another reason', async () => {
    storage.save(pair('a'));

    const result = refresher.refresh('a-access');
    http
      .expectOne('/auth/refresh')
      .flush(
        {
          success: false,
          error: { code: 'TOO_MANY_REQUESTS', message: 'Slow down' },
          timestamp: '',
        },
        { status: 429, statusText: 'Too Many Requests' },
      );

    await expect(result).rejects.toMatchObject({ code: 'TOO_MANY_REQUESTS' });
    expect(storage.read()?.refreshToken).toBe('a-refresh');
  });
});
