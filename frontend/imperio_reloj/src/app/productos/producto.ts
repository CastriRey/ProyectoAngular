export interface Producto {
  codigo_producto: number;
  nombre_producto: string;
  codigo_marca: number;
  codigo_tipo_producto: number;
  modelo_producto: string | null;
  precio_venta_producto: number;
  costo_producto: number;
  garantia_producto: number;
  descripcion_producto: string | null;
  stock_disponible_producto: number;
  stock_minimo_producto: number;
  controla_stock: 'S' | 'N';
  ultima_actualizacion_producto: string | null;
  marca_nombre?: string;
  tipo_producto_nombre?: string;
}

export interface MarcaOption {
  codigo_marca: number;
  nombre_marca: string;
}

export interface TipoProductoOption {
  codigo_tipo_producto: number;
  nombre_tipo_producto: string;
}
