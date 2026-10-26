import { HttpBackend, HttpClient, HttpContextToken, HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { inject, PLATFORM_ID } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';

import { AuthService } from './auth.service';

const apiBaseUrl = 'http://127.0.0.1:8000/api';
const tokenRefreshAttempted = new HttpContextToken<boolean>(() => false);

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const platformId = inject(PLATFORM_ID);
  if (!isPlatformBrowser(platformId)) return next(request);

  const token = localStorage.getItem('access_token');
  if (!token || request.url.includes('/api/login/') || request.url.includes('/api/token/refresh/')) return next(request);

  return next(request.clone({ setHeaders: { Authorization: `Bearer ${token}` } })).pipe(
    catchError((error: unknown) => {
      if (!(error instanceof HttpErrorResponse) || error.status !== 401) return throwError(() => error);
      if (request.context.get(tokenRefreshAttempted)) {
        inject(AuthService).cerrarSesion();
        return throwError(() => error);
      }

      const refresh = localStorage.getItem('refresh_token');
      if (!refresh) {
        inject(AuthService).cerrarSesion();
        return throwError(() => error);
      }

      const refreshClient = new HttpClient(inject(HttpBackend));
      return refreshClient.post<{ access: string }>(`${apiBaseUrl}/token/refresh/`, { refresh }).pipe(
        switchMap((respuesta) => {
          localStorage.setItem('access_token', respuesta.access);
          return next(request.clone({
            context: request.context.set(tokenRefreshAttempted, true),
            setHeaders: { Authorization: `Bearer ${respuesta.access}` },
          }));
        }),
        catchError((refreshError: unknown) => {
          inject(AuthService).cerrarSesion();
          return throwError(() => refreshError);
        }),
      );
    }),
  );
};
