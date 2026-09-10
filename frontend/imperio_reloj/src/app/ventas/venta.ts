export interface VentaDetalle {
  codigo_detalle_venta?: number;
  codigo_venta: number;
  codigo_producto: number;
  cantidad_producto: number;
  precio_unitario_producto: number;
  producto_nombre?: string;
}

export interface Venta {
  codigo_venta: number;
  identificacion_cliente_venta: number;
  identificacion_empleado_venta: number;
  total_venta: number;
  fecha_venta: string;
  codigo_metodo_pago: number;
  cliente_nombre?: string;
  empleado_nombre?: string;
  metodo_pago_nombre?: string;
  detalles: VentaDetalle[];
  servicios_relacionados?: ServicioRelacionado[];
}

export interface ServicioRelacionado {
  codigo_servicio: number;
  codigo_tipo_servicio: number;
  codigo_estado_servicio: number;
  codigo_reloj_cliente: number;
  fecha_servicio: string;
  descripcion_falla: string;
  codigo_detalle_venta?: number | null;
  cliente_id?: number | null;
  estado_servicio_nombre?: string;
  reloj_cliente_nombre?: string;
  tipo_servicio_nombre?: string;
  cliente_nombre?: string;
}

export interface VentaLinea extends VentaDetalle {
  nombre_producto: string;
}
