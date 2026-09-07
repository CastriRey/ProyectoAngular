import { HttpClient } from '@angular/common/http';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';

import { LoginRequest, LoginResponse } from './auth.types';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly loginUrl = 'http://127.0.0.1:8000/api/login/';

  // Envía las credenciales y guarda los tokens cuando Django responde correctamente.
  iniciarSesion(datos: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(this.loginUrl, datos).pipe(
      tap((respuesta) => {
        // Durante SSR no existe localStorage; solo guardamos sesión en el navegador.
        if (isPlatformBrowser(this.platformId)) {
          localStorage.setItem('access_token', respuesta.access);
          localStorage.setItem('refresh_token', respuesta.refresh);
          localStorage.setItem('user_name', respuesta.empleado.nombre);
          localStorage.setItem('user_primer_apellido', respuesta.empleado.primer_apellido);
          localStorage.setItem('user_correo', respuesta.empleado.correo);
        }
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

  cerrarSesion(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user_name');
      localStorage.removeItem('user_primer_apellido');
      localStorage.removeItem('user_correo');
    }
    void this.router.navigate(['/login']);
  }
}
