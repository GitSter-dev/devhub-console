import { HttpErrorResponse } from '@angular/common/http';
import { catchError, map, OperatorFunction, throwError } from 'rxjs';

export interface ApiErrorBody {
  code: string;
  message: string;
  fieldErrors?: Record<string, string>;
}

export interface ApiEnvelope<T> {
  success: boolean;
  data?: T;
  error?: ApiErrorBody;
  timestamp: string;
}

export class ApiFailure extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
    readonly fieldErrors: Record<string, string> = {},
  ) {
    super(message);
  }

  get isNetwork(): boolean {
    return this.status === 0;
  }
}

export function toApiFailure(error: unknown): ApiFailure {
  if (error instanceof ApiFailure) {
    return error;
  }
  if (error instanceof HttpErrorResponse) {
    const body = error.error as Partial<ApiEnvelope<unknown>> | null;
    if (body?.error?.code) {
      return new ApiFailure(
        error.status,
        body.error.code,
        body.error.message,
        body.error.fieldErrors,
      );
    }
    if (error.status === 0) {
      return new ApiFailure(
        0,
        'NETWORK',
        'The server could not be reached. Check your connection.',
      );
    }
    return new ApiFailure(error.status, 'UNKNOWN', `The server answered with ${error.status}.`);
  }
  return new ApiFailure(
    -1,
    'UNKNOWN',
    error instanceof Error ? error.message : 'Something went wrong.',
  );
}

export function unwrap<T>(): OperatorFunction<ApiEnvelope<T>, T> {
  return (source) =>
    source.pipe(
      map((envelope) => envelope.data as T),
      catchError((error: unknown) => throwError(() => toApiFailure(error))),
    );
}
