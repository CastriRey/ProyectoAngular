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
}

export interface VentaLinea extends VentaDetalle {
  nombre_producto: string;
}
