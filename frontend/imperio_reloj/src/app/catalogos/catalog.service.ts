// Servicio para gestionar los catálogos
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { CatalogoId, CatalogoRegistro } from './catalog.types';

// El servicio es el encargado de hablar con Django
@Injectable({ providedIn: 'root' })
export class CatalogService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://127.0.0.1:8000/api';
  // http://127.0.0.1:8000/api/marcas/

  listar(recurso: CatalogoId): Observable<CatalogoRegistro[]> {
    return this.http.get<CatalogoRegistro[]>(`${this.apiUrl}/${recurso}/`);
  } //Dame los registros de un catálogo, por ejemplo: marcas, tipos-producto, etc.

  crear(recurso: CatalogoId, data: Record<string, string>): Observable<CatalogoRegistro> {
    return this.http.post<CatalogoRegistro>(`${this.apiUrl}/${recurso}/`, data);
  }

  actualizar(recurso: CatalogoId, id: number, data: Record<string, string>): Observable<CatalogoRegistro> {
    return this.http.put<CatalogoRegistro>(`${this.apiUrl}/${recurso}/${id}/`, data);
  }

  eliminar(recurso: CatalogoId, id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${recurso}/${id}/`);
  }
}
