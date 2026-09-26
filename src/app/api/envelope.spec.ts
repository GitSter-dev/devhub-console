import { HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom, Observable, of, throwError } from 'rxjs';
import { ApiEnvelope, ApiFailure, unwrap } from './envelope';

async function failureOf(source: Observable<unknown>): Promise<ApiFailure> {
  try {
    await firstValueFrom(source);
  } catch (error) {
    return error as ApiFailure;
  }
  throw new Error('expected a failure');
}

describe('unwrap', () => {
  it('returns the data of a successful envelope', async () => {
    const envelope: ApiEnvelope<number> = { success: true, data: 42, timestamp: '' };

    await expect(firstValueFrom(of(envelope).pipe(unwrap()))).resolves.toBe(42);
  });

  it('turns an error envelope into a typed failure', async () => {
    const error = new HttpErrorResponse({
      status: 400,
      error: {
        success: false,
        error: { code: 'VALIDATION_FAILED', message: 'Invalid', fieldErrors: { days: 'Too many' } },
      },
    });

    const failure = await failureOf(throwError(() => error).pipe(unwrap()));

    expect(failure).toBeInstanceOf(ApiFailure);
    expect(failure).toMatchObject({ status: 400, code: 'VALIDATION_FAILED', message: 'Invalid' });
    expect(failure.fieldErrors).toEqual({ days: 'Too many' });
  });

  it('reports an unreachable server as a network failure', async () => {
    const failure = await failureOf(
      throwError(() => new HttpErrorResponse({ status: 0 })).pipe(unwrap()),
    );

    expect(failure.code).toBe('NETWORK');
    expect(failure.isNetwork).toBe(true);
  });
});
