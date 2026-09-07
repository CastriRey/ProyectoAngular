export interface Cliente {
  identificacion_cliente: number;
  nombre_cliente: string;
  primer_apellido_cliente: string;
  segundo_apellido_cliente: string | null;
  correo_cliente: string | null;
  telefono_cliente: string | null;
  identificacion_empleado: number;
  comentarios: string | null;
}
