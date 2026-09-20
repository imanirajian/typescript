import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

/**
 * Central hook for observability (would wire to real telemetry, e.g. Sentry/App Insights,
 * in a production app). Deliberately minimal here, logging is the only responsibility
 * that genuinely belongs centrally for a two-endpoint app; auth/retry are out of scope.
 */
export const errorLoggingInterceptor: HttpInterceptorFn = (req, next) =>
  next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      console.error(`[API ERROR] ${req.method} ${req.url} → ${error.status}`);
      return throwError(() => error);
    })
  );