export interface Rol {
  codigo_rol: number;
  nombre_rol: string;
}

export interface Perfil {
  codigo_perfil: number;
  nombre_perfil: string;
  codigo_rol: number;
}

export interface Ruta {
  codigo_ruta: number;
  nombre_ruta: string;
  url_ruta: string;
  nodo_ruta: string;
  padre_ruta: number | null;
  orden_ruta: number;
}

export interface Permiso {
  id?: number;
  codigo_perfil_permiso: number;
  codigo_ruta_permiso: number;
  consultar: 'S' | 'N';
  insertar: 'S' | 'N';
  modificar: 'S' | 'N';
  eliminar: 'S' | 'N';
}
