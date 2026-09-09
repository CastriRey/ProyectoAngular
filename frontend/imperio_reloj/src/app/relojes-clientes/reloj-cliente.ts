export interface RelojCliente {
  codigo_reloj_cliente: number;
  codigo_cliente: number;
  codigo_marca: number;
  modelo: string;
  descripcion_reloj: string | null;
  cliente_nombre?: string;
  marca_nombre?: string;
}

export interface MarcaOption {
  codigo_marca: number;
  nombre_marca: string;
}

export interface ClienteOption {
  identificacion_cliente: number;
  nombre_cliente: string;
  primer_apellido_cliente: string;
  segundo_apellido_cliente?: string | null;
}
