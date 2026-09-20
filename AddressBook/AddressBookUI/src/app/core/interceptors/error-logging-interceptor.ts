import { HttpErrorResponse, HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { isDevMode } from '@angular/core';
import { tap } from 'rxjs';

/**
 * Central hook for observability (would wire to real telemetry, e.g. Sentry/App Insights,
 * in a production app). Logging is the only responsibility that genuinely belongs
 * centrally for a two-endpoint app; auth/retry are out of scope.
 *
 * - Failures are always logged (method, url, status, duration).
 * - Successful calls are logged at debug level in dev mode only.
 * - Request/response bodies are never logged: they contain personal data
 *   (names, street, postcode).
 * - `tap` observes without altering the stream, so the original error is rethrown untouched.
 */
export const errorLoggingInterceptor: HttpInterceptorFn = (req, next) => {
  const started = performance.now();
  const took = () => Math.round(performance.now() - started);

  return next(req).pipe(
    tap({
      next: (event) => {
        if (isDevMode() && event instanceof HttpResponse) {
          console.debug(`[API] ${req.method} ${req.url} → ${event.status} (${took()} ms)`);
        }
      },
      error: (error: HttpErrorResponse) => {
        console.error(`[API ERROR] ${req.method} ${req.url} → ${error.status} (${took()} ms)`);
      },
    })
  );
};