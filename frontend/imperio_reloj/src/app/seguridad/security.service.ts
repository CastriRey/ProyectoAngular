import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { Permiso, Perfil, Rol, Ruta } from './security.types';

@Injectable({ providedIn: 'root' })
export class SecurityService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://127.0.0.1:8000/api';

  // Cada método representa una operación HTTP que Angular ejecuta contra Django.
  roles(): Observable<Rol[]> { return this.http.get<Rol[]>(`${this.apiUrl}/roles/`); }
  crearRol(data: Omit<Rol, 'codigo_rol'>): Observable<Rol> { return this.http.post<Rol>(`${this.apiUrl}/roles/`, data); }
  actualizarRol(id: number, data: Omit<Rol, 'codigo_rol'>): Observable<Rol> { return this.http.put<Rol>(`${this.apiUrl}/roles/${id}/`, data); }
  eliminarRol(id: number): Observable<void> { return this.http.delete<void>(`${this.apiUrl}/roles/${id}/`); }

  perfiles(): Observable<Perfil[]> { return this.http.get<Perfil[]>(`${this.apiUrl}/perfiles/`); }
  crearPerfil(data: Omit<Perfil, 'codigo_perfil'>): Observable<Perfil> { return this.http.post<Perfil>(`${this.apiUrl}/perfiles/`, data); }
  actualizarPerfil(id: number, data: Omit<Perfil, 'codigo_perfil'>): Observable<Perfil> { return this.http.put<Perfil>(`${this.apiUrl}/perfiles/${id}/`, data); }
  eliminarPerfil(id: number): Observable<void> { return this.http.delete<void>(`${this.apiUrl}/perfiles/${id}/`); }

  rutas(): Observable<Ruta[]> { return this.http.get<Ruta[]>(`${this.apiUrl}/rutas/`); }
  crearRuta(data: Omit<Ruta, 'codigo_ruta'>): Observable<Ruta> { return this.http.post<Ruta>(`${this.apiUrl}/rutas/`, data); }
  actualizarRuta(id: number, data: Omit<Ruta, 'codigo_ruta'>): Observable<Ruta> { return this.http.put<Ruta>(`${this.apiUrl}/rutas/${id}/`, data); }
  eliminarRuta(id: number): Observable<void> { return this.http.delete<void>(`${this.apiUrl}/rutas/${id}/`); }

  permisos(): Observable<Permiso[]> { return this.http.get<Permiso[]>(`${this.apiUrl}/permisos/`); }
  crearPermiso(data: Omit<Permiso, 'id'>): Observable<Permiso> { return this.http.post<Permiso>(`${this.apiUrl}/permisos/`, data); }
  actualizarPermiso(id: number, data: Omit<Permiso, 'id'>): Observable<Permiso> { return this.http.put<Permiso>(`${this.apiUrl}/permisos/${id}/`, data); }
  eliminarPermiso(id: number): Observable<void> { return this.http.delete<void>(`${this.apiUrl}/permisos/${id}/`); }
}
