import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SessionStore } from '../session/session-store';

export const adminGuard: CanActivateFn = (_route, state) => {
  const session = inject(SessionStore);
  return (
    session.signedIn() ||
    inject(Router).createUrlTree(['/login'], { queryParams: { returnUrl: state.url } })
  );
};

export const guestGuard: CanActivateFn = () =>
  !inject(SessionStore).signedIn() || inject(Router).createUrlTree(['/']);
