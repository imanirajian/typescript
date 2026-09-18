import { TestBed } from '@angular/core/testing';
import { HttpInterceptorFn } from '@angular/common/http';
import { errorLoggingInterceptor } from '../interceptors/error-logging-interceptor';

describe('errorLoggingInterceptor', () => {
  const interceptor: HttpInterceptorFn = (req, next) =>
    TestBed.runInInjectionContext(() => errorLoggingInterceptor(req, next));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(interceptor).toBeTruthy();
  });
});
