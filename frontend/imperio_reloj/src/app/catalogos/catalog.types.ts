// CatalogoId puede trabajar con estos cinco
export type CatalogoId = 'marcas' | 'metodos-pago' | 'tipos-producto' | 'tipos-servicio' | 'estados-servicio';

// Un bojeto de configuración debe tener estas propiedades.
// Si se va a trabajar con CatalogoConfig debe tener esta estructura y tipos de datos.
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

//Un registro puede tener propiedades cuyo nombre no conocemos de antemano, y cuyo valor puede ser string o number
export interface CatalogoRegistro {
  [key: string]: number | string;
}
