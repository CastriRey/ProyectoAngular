export interface Servicio {
  codigo_servicio: number;
  codigo_tecnico: number;
  codigo_tipo_servicio: number;
  codigo_estado_servicio: number;
  codigo_reloj_cliente: number;
  codigo_detalle_venta: number | null;
  fecha_servicio: string;
  descripcion_falla: string;
  tecnico_nombre?: string;
  tipo_servicio_nombre?: string;
  estado_servicio_nombre?: string;
  reloj_cliente_nombre?: string;
  cliente_nombre?: string;
}

export interface RelojCliente {
  codigo_reloj_cliente: number;
  codigo_cliente: number;
  codigo_marca: number;
  modelo: string;
  descripcion_reloj: string | null;
  cliente_nombre?: string;
  marca_nombre?: string;
}

export interface TipoServicioOption { codigo_tipo_servicio: number; nombre_tipo_servicio: string; }
export interface EstadoServicioOption { codigo_estado_servicio: number; nombre_estado_reparacion: string; }
