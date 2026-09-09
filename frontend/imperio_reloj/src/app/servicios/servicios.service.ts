import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { Empleado } from '../empleados/empleado';
import { EstadoServicioOption, RelojCliente, Servicio, TipoServicioOption } from './servicio';

@Injectable({ providedIn: 'root' })
export class ServiciosService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://127.0.0.1:8000/api';

  obtenerServicios(): Observable<Servicio[]> { return this.http.get<Servicio[]>(`${this.apiUrl}/servicios/`); }
  obtenerServicio(id: number): Observable<Servicio> { return this.http.get<Servicio>(`${this.apiUrl}/servicios/${id}/`); }
  obtenerEmpleados(): Observable<Empleado[]> { return this.http.get<Empleado[]>(`${this.apiUrl}/empleados/`); }
  obtenerTipos(): Observable<TipoServicioOption[]> { return this.http.get<TipoServicioOption[]>(`${this.apiUrl}/tipos-servicio/`); }
  obtenerEstados(): Observable<EstadoServicioOption[]> { return this.http.get<EstadoServicioOption[]>(`${this.apiUrl}/estados-servicio/`); }
  obtenerRelojes(): Observable<RelojCliente[]> { return this.http.get<RelojCliente[]>(`${this.apiUrl}/relojes-clientes/`); }
  crearServicio(servicio: Omit<Servicio, 'codigo_servicio' | 'tecnico_nombre' | 'tipo_servicio_nombre' | 'estado_servicio_nombre' | 'reloj_cliente_nombre' | 'cliente_nombre'>): Observable<Servicio> { return this.http.post<Servicio>(`${this.apiUrl}/servicios/`, servicio); }
  actualizarServicio(id: number, servicio: Partial<Servicio>): Observable<Servicio> { return this.http.put<Servicio>(`${this.apiUrl}/servicios/${id}/`, servicio); }
  eliminarServicio(id: number): Observable<void> { return this.http.delete<void>(`${this.apiUrl}/servicios/${id}/`); }
}
