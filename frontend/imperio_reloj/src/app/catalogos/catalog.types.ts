export type CatalogoId = 'marcas' | 'metodos-pago' | 'tipos-servicio' | 'estados-servicio';

export interface CatalogoConfig {
  recurso: CatalogoId;
  titulo: string;
  descripcion: string;
  rutaLista: string;
  rutaNuevo: string;
  icono: string;
  idKey: string;
  nameKey: string;
  nameLabel: string;
  placeholder: string;
}

export interface CatalogoRegistro {
  [key: string]: number | string;
}
