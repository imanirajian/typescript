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

  it('logs the method, url and status of a failed request, and rethrows the same error', () => {
    const log = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    let caught: unknown;

    http.get('/thing').subscribe({ error: (error: unknown) => (caught = error) });
    controller.expectOne('/thing').flush('nope', { status: 500, statusText: 'Server Error' });

    expect(log).toHaveBeenCalledWith(expect.stringContaining('GET /thing'));
    expect(log).toHaveBeenCalledWith(expect.stringContaining('500'));
    expect(caught).toBeInstanceOf(HttpErrorResponse);
    expect((caught as HttpErrorResponse).status).toBe(500);
  });

  it('stays silent for successful requests', () => {
    const log = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    http.get('/thing').subscribe();
    controller.expectOne('/thing').flush({});

    expect(log).not.toHaveBeenCalled();
  });
});
