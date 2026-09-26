import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { retry, throwError, timer } from 'rxjs';
import { backoff } from './backoff';

const RETRYABLE_STATUSES = new Set([0, 502, 503, 504]);
const MAX_RETRIES = 3;

export const retryInterceptor: HttpInterceptorFn = (request, next) => {
  if (request.method !== 'GET') {
    return next(request);
  }
  return next(request).pipe(
    retry({
      count: MAX_RETRIES,
      delay: (error: unknown, attempt: number) =>
        error instanceof HttpErrorResponse && RETRYABLE_STATUSES.has(error.status)
          ? timer(backoff(attempt))
          : throwError(() => error),
    }),
  );
};
