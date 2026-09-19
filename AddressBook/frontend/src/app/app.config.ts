import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideBrowserGlobalErrorListeners, type ApplicationConfig } from '@angular/core';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideRouter, withComponentInputBinding } from '@angular/router';

import { errorLoggingInterceptor } from './core/interceptors/error-logging-interceptor';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    // withComponentInputBinding: route params (:id) arrive as signal inputs.
    provideRouter(routes, withComponentInputBinding()),
    // Angular 22's HttpClient uses fetch by default; the interceptor is the
    // single place failed requests are logged.
    provideHttpClient(withInterceptors([errorLoggingInterceptor])),
    // SSR is enabled: hydrate instead of re-rendering, and reuse GET responses
    // fetched on the server (HTTP transfer cache is on by default).
    provideClientHydration(withEventReplay()),
  ],
};
