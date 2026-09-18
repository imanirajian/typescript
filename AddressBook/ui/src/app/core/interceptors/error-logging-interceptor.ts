import { HttpInterceptorFn } from '@angular/common/http';

export const errorLoggingInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req);
};
