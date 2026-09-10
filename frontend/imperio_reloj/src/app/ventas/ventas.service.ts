import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { Cliente } from '../clientes/cliente';
import { Empleado } from '../empleados/empleado';
import { MarcaOption, Producto, TipoProductoOption } from '../productos/producto';
import { ServicioRelacionado, Venta } from './venta';

interface MetodoPagoOption { codigo_metodo_pago: number; nombre_metodo_pago: string; }

@Injectable({ providedIn: 'root' })
export class VentasService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://127.0.0.1:8000/api';

  obtenerVentas(): Observable<Venta[]> { return this.http.get<Venta[]>(`${this.apiUrl}/ventas/`); }
  obtenerVenta(id: number): Observable<Venta> { return this.http.get<Venta>(`${this.apiUrl}/ventas/${id}/`); }
  obtenerClientes(): Observable<Cliente[]> { return this.http.get<Cliente[]>(`${this.apiUrl}/clientes/`); }
  obtenerEmpleados(): Observable<Empleado[]> { return this.http.get<Empleado[]>(`${this.apiUrl}/empleados/`); }
  obtenerProductos(): Observable<Producto[]> { return this.http.get<Producto[]>(`${this.apiUrl}/productos/`); }
  obtenerMetodosPago(): Observable<MetodoPagoOption[]> { return this.http.get<MetodoPagoOption[]>(`${this.apiUrl}/metodos-pago/`); }
  obtenerServicios(): Observable<ServicioRelacionado[]> { return this.http.get<ServicioRelacionado[]>(`${this.apiUrl}/servicios/`); }
  crearVenta(data: { identificacion_cliente_venta: number; identificacion_empleado_venta: number; total_venta: number; fecha_venta: string; codigo_metodo_pago: number; lineas: object[]; servicios: number[] }): Observable<Venta> {
    return this.http.post<Venta>(`${this.apiUrl}/ventas/`, data);
  }
}

export type { MetodoPagoOption };
