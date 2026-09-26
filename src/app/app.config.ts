import {
  ApplicationConfig,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import Aura from '@primeuix/themes/aura';
import { ConfirmationService, MessageService } from 'primeng/api';
import { providePrimeNG } from 'primeng/config';
import { routes } from './app.routes';
import { authInterceptor } from './http/auth-interceptor';
import { retryInterceptor } from './http/retry-interceptor';
import { SessionStore } from './session/session-store';
import { DARK_CLASS } from './layout/theme';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(withInterceptors([authInterceptor, retryInterceptor])),
    providePrimeNG({ theme: { preset: Aura, options: { darkModeSelector: `.${DARK_CLASS}` } } }),
    MessageService,
    ConfirmationService,
    provideAppInitializer(() => inject(SessionStore).restore()),
  ],
};
