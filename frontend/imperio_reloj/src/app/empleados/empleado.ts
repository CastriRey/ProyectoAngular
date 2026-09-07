export interface Empleado {
  identificacion_empleado: number;
  nombre_empleado: string;
  primer_apellido_empleado: string;
  segundo_apellido_empleado: string;
  correo_empleado: string;
  telefono_empleado: string;
  direccion_empleado: string;
  password?: string;
  codigo_perfil_empleado: number;
}
