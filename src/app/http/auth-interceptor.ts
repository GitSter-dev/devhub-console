import { HttpErrorResponse, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, from, switchMap, throwError } from 'rxjs';
import { SessionRefresher } from '../session/session-refresher';
import { TokenStorage } from '../session/token-storage';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  if (request.url.startsWith('/auth/')) {
    return next(request);
  }
  const token = inject(TokenStorage).accessToken();
  const refresher = inject(SessionRefresher);
  return next(withBearer(request, token)).pipe(
    catchError((error: unknown) => {
      if (!(error instanceof HttpErrorResponse) || error.status !== 401 || !token) {
        return throwError(() => error);
      }
      return from(refresher.refresh(token)).pipe(
        switchMap((fresh) => next(withBearer(request, fresh))),
      );
    }),
  );
};

function withBearer<T>(request: HttpRequest<T>, token: string | null): HttpRequest<T> {
  return token ? request.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : request;
}
