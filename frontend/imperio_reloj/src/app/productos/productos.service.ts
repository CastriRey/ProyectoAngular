import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { MarcaOption, Producto, TipoProductoOption } from './producto';

@Injectable({ providedIn: 'root' })
export class ProductosService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://127.0.0.1:8000/api';

  obtenerProductos(): Observable<Producto[]> { return this.http.get<Producto[]>(`${this.apiUrl}/productos/`); }
  obtenerMarcas(): Observable<MarcaOption[]> { return this.http.get<MarcaOption[]>(`${this.apiUrl}/marcas/`); }
  obtenerTiposProducto(): Observable<TipoProductoOption[]> { return this.http.get<TipoProductoOption[]>(`${this.apiUrl}/tipos-producto/`); }
  crearProducto(producto: Omit<Producto, 'codigo_producto' | 'marca_nombre' | 'tipo_producto_nombre'>): Observable<Producto> { return this.http.post<Producto>(`${this.apiUrl}/productos/`, producto); }
  actualizarProducto(id: number, producto: Partial<Producto>): Observable<Producto> { return this.http.put<Producto>(`${this.apiUrl}/productos/${id}/`, producto); }
  eliminarProducto(id: number): Observable<void> { return this.http.delete<void>(`${this.apiUrl}/productos/${id}/`); }
}
