import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ClienteOption, MarcaOption, RelojCliente } from './reloj-cliente';

@Injectable({ providedIn: 'root' })
export class RelojesClientesService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://127.0.0.1:8000/api';

  obtenerRelojes(): Observable<RelojCliente[]> { return this.http.get<RelojCliente[]>(`${this.apiUrl}/relojes-clientes/`); }
  obtenerClientes(): Observable<ClienteOption[]> { return this.http.get<ClienteOption[]>(`${this.apiUrl}/clientes/`); }
  obtenerMarcas(): Observable<MarcaOption[]> { return this.http.get<MarcaOption[]>(`${this.apiUrl}/marcas/`); }
  crearReloj(data: Omit<RelojCliente, 'codigo_reloj_cliente' | 'cliente_nombre' | 'marca_nombre'>): Observable<RelojCliente> { return this.http.post<RelojCliente>(`${this.apiUrl}/relojes-clientes/`, data); }
  actualizarReloj(id: number, data: Partial<RelojCliente>): Observable<RelojCliente> { return this.http.put<RelojCliente>(`${this.apiUrl}/relojes-clientes/${id}/`, data); }
  eliminarReloj(id: number): Observable<void> { return this.http.delete<void>(`${this.apiUrl}/relojes-clientes/${id}/`); }
}
