import { HttpParams } from '@angular/common/http';

export function query(values: Record<string, string | number | null | undefined>): HttpParams {
  return Object.entries(values).reduce(
    (params, [key, value]) =>
      value === null || value === undefined || value === '' ? params : params.set(key, value),
    new HttpParams(),
  );
}
