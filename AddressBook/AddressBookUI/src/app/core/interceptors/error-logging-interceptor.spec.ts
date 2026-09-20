import { HttpClient, HttpErrorResponse, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { errorLoggingInterceptor } from './error-logging-interceptor';

describe('errorLoggingInterceptor', () => {
  let http: HttpClient;
  let controller: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([errorLoggingInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    http = TestBed.inject(HttpClient);
    controller = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    controller.verify();
    vi.restoreAllMocks();
  });

  it('logs successful requests at debug level with status and duration, never the body', () => {
    const debug = vi.spyOn(console, 'debug').mockImplementation(() => undefined);

    http.post('/thing', { street1: 'secret' }).subscribe();
    controller.expectOne('/thing').flush({ postcode: 'CV376HP' }, { status: 201, statusText: 'Created' });

    expect(debug).toHaveBeenCalledTimes(1);
    const line = debug.mock.calls[0][0] as string;
    expect(line).toMatch(/^\[API\] POST \/thing → 201 \(\d+ ms\)$/);
    expect(line).not.toContain('secret');
    expect(line).not.toContain('CV376HP');
  });

  it('includes the duration in the failure log', () => {
    const log = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    http.get('/thing').subscribe({ error: () => undefined });
    controller.expectOne('/thing').flush('nope', { status: 404, statusText: 'Not Found' });

    expect(log).toHaveBeenCalledWith(expect.stringMatching(/GET \/thing → 404 \(\d+ ms\)/));
  });
});
