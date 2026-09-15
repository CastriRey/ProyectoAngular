import { AbstractControl, FormGroup } from '@angular/forms';

const FIELD_LABELS: Record<string, string> = {
  identificacion_cliente: 'Identificación del cliente',
  identificacion_empleado: 'Identificación del empleado',
  nombre_cliente: 'Nombre del cliente',
  nombre_empleado: 'Nombre del empleado',
  primer_apellido_cliente: 'Primer apellido',
  primer_apellido_empleado: 'Primer apellido',
  correo_cliente: 'Correo del cliente',
  correo_empleado: 'Correo del empleado',
  codigo_perfil_empleado: 'Perfil',
  codigo_marca: 'Marca',
  codigo_tipo_producto: 'Tipo de producto',
  codigo_cliente: 'Cliente',
  codigo_tecnico: 'Técnico',
  codigo_tipo_servicio: 'Tipo de servicio',
  codigo_estado_servicio: 'Estado del servicio',
  codigo_reloj_cliente: 'Reloj del cliente',
  identificacion_cliente_venta: 'Cliente de la venta',
  identificacion_empleado_venta: 'Empleado de la venta',
  codigo_metodo_pago: 'Método de pago',
  codigo_producto: 'Producto',
  cantidad_producto: 'Cantidad',
  codigo_rol: 'Rol',
  codigo_perfil_permiso: 'Perfil',
  codigo_ruta_permiso: 'Ruta',
};

export function formValidationMessage(form: FormGroup): string {
  const errors = Object.entries(form.controls)
    .filter(([, control]) => control.invalid && (control.touched || control.dirty))
    .map(([name, control]) => `${FIELD_LABELS[name] ?? name}: ${controlMessage(control)}`);
  return errors.join(' | ') || 'Revisa los campos obligatorios.';
}

export function apiErrorMessage(error: unknown, fallback: string): string {
  if (typeof error === 'string') return error;
  if (!error || typeof error !== 'object') return fallback;
  const details = Object.entries(error as Record<string, unknown>)
    .map(([field, messages]) => `${FIELD_LABELS[field] ?? field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
    .join(' | ');
  return details || fallback;
}

function controlMessage(control: AbstractControl): string {
  if (control.hasError('required')) return 'Este campo es obligatorio.';
  if (control.hasError('email')) return 'Escribe un correo válido.';
  if (control.hasError('min')) return 'El valor debe ser mayor que cero.';
  if (control.hasError('maxlength')) return 'El texto es demasiado largo.';
  return 'Valor inválido.';
}
