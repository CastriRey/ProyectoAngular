import { HttpClient } from '@angular/common/http';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { map, Observable, of, shareReplay } from 'rxjs';

interface PermissionEntry {
  consultar: string;
  insertar: string;
  modificar: string;
  eliminar: string;
}

interface PermissionResponse {
  acceso_total: boolean;
  permisos: Record<string, PermissionEntry>;
}

@Injectable({ providedIn: 'root' })
export class PermissionService {
  private readonly http = inject(HttpClient);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly permissionsUrl = 'http://127.0.0.1:8000/api/mis-permisos/';
  private permissions$: Observable<PermissionResponse> | null = null;
  private currentPermissions: PermissionResponse | null = null;

  obtenerPermisos(): Observable<PermissionResponse> {
    if (!isPlatformBrowser(this.platformId)) return of({ acceso_total: true, permisos: {} });
    this.permissions$ ??= this.http.get<PermissionResponse>(this.permissionsUrl).pipe(shareReplay(1));
    this.permissions$.subscribe((response) => this.currentPermissions = response);
    return this.permissions$;
  }

  limpiar(): void {
    this.permissions$ = null;
    this.currentPermissions = null;
  }

  puedeAcceder(url: string): Observable<boolean> {
    const [path, action] = this.routeAndAction(url);
    return new Observable<boolean>((subscriber) => {
      this.obtenerPermisos().subscribe({
        next: (response) => subscriber.next(response.acceso_total || this.hasPermission(response.permisos, path, action)),
        error: () => subscriber.next(false),
        complete: () => subscriber.complete(),
      });
    });
  }

  tieneAlgunaRutaConsultable(): Observable<boolean> {
    return this.obtenerPermisos().pipe(
      map((response) => response.acceso_total || Object.values(response.permisos).some((permiso) => permiso.consultar === 'S')),
    );
  }

  puede(path: string, action: keyof PermissionEntry = 'consultar'): boolean {
    if (!isPlatformBrowser(this.platformId)) return true;
    if (localStorage.getItem('user_perfil') === '1') return true;
    return Boolean(this.currentPermissions && (
      this.currentPermissions.acceso_total || this.hasPermission(this.currentPermissions.permisos, path, action)
    ));
  }

  private routeAndAction(url: string): [string, keyof PermissionEntry] {
    const path = `/${url.split('?')[0].split('#')[0].replace(/^\//, '').replace(/\/$/, '')}/`;
    const parts = path.split('/').filter(Boolean);
    const actionPart = parts.at(-1);
    if (actionPart === 'nuevo' || actionPart === 'crear') return [`/${parts.slice(0, -1).join('/')}/`, 'insertar'];
    if (actionPart === 'editar') return [`/${parts.slice(0, -2).join('/')}/`, 'modificar'];
    if (actionPart === 'eliminar') return [`/${parts.slice(0, -2).join('/')}/`, 'eliminar'];
    if (parts.length >= 2 && /^\d+$/.test(parts.at(-1) ?? '')) return [`/${parts.slice(0, -1).join('/')}/`, 'consultar'];
    return [path, 'consultar'];
  }

  private hasPermission(permisos: Record<string, PermissionEntry>, path: string, action: keyof PermissionEntry): boolean {
    const normalizedPath = path.toLowerCase();
    const exact = Object.entries(permisos).find(([storedPath]) => storedPath.toLowerCase() === normalizedPath)?.[1];
    if (exact?.[action] === 'S') return true;
    return Object.entries(permisos).some(([pattern, entry]) => this.matches(normalizedPath, pattern.toLowerCase()) && entry[action] === 'S');
  }

  private matches(path: string, pattern: string): boolean {
    const pathParts = path.split('/').filter(Boolean);
    const patternParts = pattern.split('/').filter(Boolean);
    return pathParts.length === patternParts.length && patternParts.every((part, index) =>
      part === pathParts[index] || part.startsWith('<') || (part.startsWith('{') && part.endsWith('}')),
    );
  }
}
