import { HttpClient } from '@angular/common/http';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';

import { LoginRequest, LoginResponse, TokenRefreshResponse } from './auth.types';
import { PermissionService } from './permission.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly document = inject(DOCUMENT);
  private readonly permissionService = inject(PermissionService);
  private readonly loginUrl = 'http://127.0.0.1:8000/api/login/';
  private readonly inactivityLimit = 10 * 60 * 1000;
  private activityTimer: number | undefined;
  private lastActivityWrite = 0;

  constructor() {
    if (!isPlatformBrowser(this.platformId)) return;

    const registerActivity = (): void => {
      if (!localStorage.getItem('access_token')) return;
      const now = Date.now();
      if (now - this.lastActivityWrite < 30_000) return;
      this.lastActivityWrite = now;
      localStorage.setItem('last_activity', String(now));
    };
    ['click', 'keydown', 'pointerdown', 'touchstart'].forEach((eventName) => {
      this.document.addEventListener(eventName, registerActivity, { passive: true });
    });
    this.activityTimer = window.setInterval(() => this.verificarInactividad(), 30_000);
  }

  // Envía las credenciales y guarda los tokens cuando Django responde correctamente.
  iniciarSesion(datos: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(this.loginUrl, datos).pipe(
      tap((respuesta) => {
        // Durante SSR no existe localStorage; solo guardamos sesión en el navegador.
        if (isPlatformBrowser(this.platformId)) {
          localStorage.setItem('access_token', respuesta.access);
          localStorage.setItem('refresh_token', respuesta.refresh);
          localStorage.setItem('user_id', String(respuesta.empleado.id));
          localStorage.setItem('user_name', respuesta.empleado.nombre);
          localStorage.setItem('user_primer_apellido', respuesta.empleado.primer_apellido);
          localStorage.setItem('user_correo', respuesta.empleado.correo);
          localStorage.setItem('user_perfil', String(respuesta.empleado.perfil));
          localStorage.setItem('last_activity', String(Date.now()));
        }
      }),
    );
  }

  renovarAccessToken(): Observable<TokenRefreshResponse> {
    const refresh = isPlatformBrowser(this.platformId) ? localStorage.getItem('refresh_token') : null;
    return this.http.post<TokenRefreshResponse>('http://127.0.0.1:8000/api/token/refresh/', { refresh }).pipe(
      tap((respuesta) => {
        if (isPlatformBrowser(this.platformId)) localStorage.setItem('access_token', respuesta.access);
      }),
    );
  }

  // El guard usa este método para saber si existe una sesión local.
  estaAutenticado(): boolean {
    // En el servidor dejamos renderizar la ruta; el guard se vuelve a evaluar en el navegador.
    return !isPlatformBrowser(this.platformId) || Boolean(localStorage.getItem('access_token'));
  }

  obtenerNombreUsuario(): string {
    if (!isPlatformBrowser(this.platformId)) {
      return 'usuario';
    }

    // El nav muestra los dos datos que se guardaron al iniciar sesión.
    const nombre = localStorage.getItem('user_name') ?? '';
    const primerApellido = localStorage.getItem('user_primer_apellido') ?? '';
    return `${nombre} ${primerApellido}`.trim() || 'usuario';
  }

  obtenerIdUsuario(): number | null {
    if (!isPlatformBrowser(this.platformId)) return null;
    const id = Number(localStorage.getItem('user_id'));
    return Number.isInteger(id) && id > 0 ? id : null;
  }

  cerrarSesion(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user_id');
      localStorage.removeItem('user_name');
      localStorage.removeItem('user_primer_apellido');
      localStorage.removeItem('user_correo');
      localStorage.removeItem('user_perfil');
      localStorage.removeItem('last_activity');
    }
    this.permissionService.limpiar();
    void this.router.navigate(['/login']);
  }

  private verificarInactividad(): void {
    const lastActivity = Number(localStorage.getItem('last_activity'));
    if (localStorage.getItem('access_token') && (!lastActivity || Date.now() - lastActivity > this.inactivityLimit)) {
      this.cerrarSesion();
    }
  }
}
