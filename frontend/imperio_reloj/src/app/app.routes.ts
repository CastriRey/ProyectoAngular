import { Route, Routes } from '@angular/router';
import { ClientesPage } from './clientes/clientes-page';
import { EmpleadosPage } from './empleados/empleados-page';
import { DashboardPage } from './dashboard/dashboard-page';
import { LoginPage } from './login/login-page';
import { authGuard } from './auth/auth.guard';
import { PermisosPage } from './seguridad/permisos/permisos-page';
import { PerfilesPage } from './seguridad/perfiles/perfiles-page';
import { RolesPage } from './seguridad/roles/roles-page';
import { RutasPage } from './seguridad/rutas/rutas-page';
import { ProductosPage } from './productos/productos-page';
import { CatalogPage } from './catalogos/catalog-page';
import { ModulePage } from './shared/module-page/module-page';

// Esta función evita repetir la configuración de todas las páginas del sistema.
const modulo = (
	path: string,
	titulo: string,
	descripcion: string,
	data: Record<string, unknown>,
): Route => ({
	path,
	component: ModulePage,
	canActivate: [authGuard],
	data: { titulo, descripcion, ...data },
});

const catalogo = (
	path: string,
	recurso: 'marcas' | 'metodos-pago' | 'tipos-servicio' | 'estados-servicio',
	titulo: string,
	descripcion: string,
	icono: string,
	idKey: string,
	nameKey: string,
	nameLabel: string,
): Route => ({
	path,
	component: CatalogPage,
	canActivate: [authGuard],
	data: {
		catalogo: {
			recurso,
			titulo,
			descripcion,
			rutaLista: `/${path.split('/')[0]}`,
			rutaNuevo: `/${path.split('/')[0]}/nuevo`,
			icono,
			idKey,
			nameKey,
			nameLabel,
			placeholder: `Escribe el nombre de ${nameLabel.toLowerCase()}`,
		},
	},
});

export const routes: Routes = [
	// La ruta inicial siempre muestra el formulario de autenticación.
	{ path: '', redirectTo: 'login', pathMatch: 'full' },
	{ path: 'login', component: LoginPage },
	// El guard impide acceder al dashboard sin un token guardado.
	{ path: 'dashboard', component: DashboardPage, canActivate: [authGuard] },
	{ path: 'clientes', component: ClientesPage, canActivate: [authGuard] },
	{ path: 'empleados', component: EmpleadosPage, canActivate: [authGuard] },
	{ path: 'empleados/nuevo', component: EmpleadosPage, canActivate: [authGuard] },
	{ path: 'empleados/:id/editar', component: EmpleadosPage, canActivate: [authGuard] },
	{ path: 'empleados/:id/eliminar', component: EmpleadosPage, canActivate: [authGuard] },
	{ path: 'clientes/nuevo', component: ClientesPage, canActivate: [authGuard] },
	{ path: 'clientes/:id/editar', component: ClientesPage, canActivate: [authGuard] },
	{ path: 'clientes/:id/eliminar', component: ClientesPage, canActivate: [authGuard] },
	modulo('relojes-clientes', 'Relojes de clientes', 'Administra los relojes registrados por los clientes.', {
		tipo: 'lista', rutaLista: '/relojes-clientes', rutaNuevo: '/relojes-clientes/nuevo', columnas: ['Código', 'Cliente', 'Marca', 'Modelo'],
	}),
	modulo('relojes-clientes/nuevo', 'Nuevo reloj de cliente', 'Registra un reloj perteneciente a un cliente.', {
		tipo: 'formulario', rutaLista: '/relojes-clientes', rutaNuevo: null, columnas: [],
	}),
	modulo('relojes-clientes/:id/editar', 'Editar reloj de cliente', 'Actualiza los datos del reloj.', {
		tipo: 'formulario', rutaLista: '/relojes-clientes', rutaNuevo: null, columnas: [],
	}),
	modulo('relojes-clientes/:id/eliminar', 'Eliminar reloj de cliente', 'Confirma la eliminación del reloj.', {
		tipo: 'confirmacion', rutaLista: '/relojes-clientes', rutaNuevo: null, columnas: [],
	}),
	{ path: 'productos', component: ProductosPage, canActivate: [authGuard] },
	{ path: 'productos/nuevo', component: ProductosPage, canActivate: [authGuard] },
	{ path: 'productos/:id/editar', component: ProductosPage, canActivate: [authGuard] },
	{ path: 'productos/:id/eliminar', component: ProductosPage, canActivate: [authGuard] },
	catalogo('marcas', 'marcas', 'Marcas', 'Administra las marcas de productos.', 'bi-bookmark-star', 'codigo_marca', 'nombre_marca', 'Nombre'),
	catalogo('marcas/nuevo', 'marcas', 'Marcas', 'Administra las marcas de productos.', 'bi-bookmark-star', 'codigo_marca', 'nombre_marca', 'Nombre'),
	catalogo('marcas/:id/editar', 'marcas', 'Marcas', 'Administra las marcas de productos.', 'bi-bookmark-star', 'codigo_marca', 'nombre_marca', 'Nombre'),
	catalogo('marcas/:id/eliminar', 'marcas', 'Marcas', 'Administra las marcas de productos.', 'bi-bookmark-star', 'codigo_marca', 'nombre_marca', 'Nombre'),
	modulo('tipos-producto', 'Tipos de producto', 'Administra las categorías de productos.', {
		tipo: 'lista', rutaLista: '/tipos-producto', rutaNuevo: '/tipos-producto/nuevo', columnas: ['Código', 'Nombre'],
	}),
	modulo('tipos-producto/nuevo', 'Nuevo tipo de producto', 'Registra una categoría de producto.', {
		tipo: 'formulario', rutaLista: '/tipos-producto', rutaNuevo: null, columnas: [],
	}),
	modulo('tipos-producto/:id/editar', 'Editar tipo de producto', 'Actualiza una categoría.', {
		tipo: 'formulario', rutaLista: '/tipos-producto', rutaNuevo: null, columnas: [],
	}),
	modulo('tipos-producto/:id/eliminar', 'Eliminar tipo de producto', 'Confirma la eliminación de la categoría.', {
		tipo: 'confirmacion', rutaLista: '/tipos-producto', rutaNuevo: null, columnas: [],
	}),
	catalogo('metodos-pago', 'metodos-pago', 'Métodos de pago', 'Administra las formas de pago.', 'bi-credit-card', 'codigo_metodo_pago', 'nombre_metodo_pago', 'Nombre'),
	catalogo('metodos-pago/nuevo', 'metodos-pago', 'Métodos de pago', 'Administra las formas de pago.', 'bi-credit-card', 'codigo_metodo_pago', 'nombre_metodo_pago', 'Nombre'),
	catalogo('metodos-pago/:id/editar', 'metodos-pago', 'Métodos de pago', 'Administra las formas de pago.', 'bi-credit-card', 'codigo_metodo_pago', 'nombre_metodo_pago', 'Nombre'),
	catalogo('metodos-pago/:id/eliminar', 'metodos-pago', 'Métodos de pago', 'Administra las formas de pago.', 'bi-credit-card', 'codigo_metodo_pago', 'nombre_metodo_pago', 'Nombre'),
	modulo('ventas', 'Ventas', 'Consulta las ventas registradas.', {
		tipo: 'lista', rutaLista: '/ventas', rutaNuevo: '/ventas/nueva', columnas: ['Código', 'Cliente', 'Fecha', 'Total'],
	}),
	modulo('ventas/nueva', 'Nueva venta', 'Registra una venta y sus productos.', {
		tipo: 'formulario', rutaLista: '/ventas', rutaNuevo: null, columnas: [],
	}),
	modulo('ventas/:id', 'Detalle de venta', 'Consulta el detalle de una venta.', {
		tipo: 'detalle', rutaLista: '/ventas', rutaNuevo: null, columnas: ['Código', 'Cliente', 'Empleado', 'Total', 'Fecha'],
	}),
	modulo('servicios', 'Servicios', 'Administra las reparaciones y servicios técnicos.', {
		tipo: 'lista', rutaLista: '/servicios', rutaNuevo: '/servicios/nuevo', columnas: ['Código', 'Reloj', 'Estado', 'Fecha'],
	}),
	modulo('servicios/finalizados', 'Servicios finalizados', 'Consulta los servicios técnicos terminados.', {
		tipo: 'lista', rutaLista: '/servicios/finalizados', rutaNuevo: null, columnas: ['Código', 'Reloj', 'Estado', 'Fecha'],
	}),
	modulo('servicios/nuevo', 'Nuevo servicio', 'Registra una reparación o servicio técnico.', {
		tipo: 'formulario', rutaLista: '/servicios', rutaNuevo: null, columnas: [],
	}),
	modulo('servicios/:id/editar', 'Editar servicio', 'Actualiza la información del servicio.', {
		tipo: 'formulario', rutaLista: '/servicios', rutaNuevo: null, columnas: [],
	}),
	modulo('servicios/:id/eliminar', 'Eliminar servicio', 'Confirma la eliminación del servicio.', {
		tipo: 'confirmacion', rutaLista: '/servicios', rutaNuevo: null, columnas: [],
	}),
	catalogo('tipos-servicio', 'tipos-servicio', 'Tipos de servicio', 'Administra los tipos de reparación disponibles.', 'bi-tools', 'codigo_tipo_servicio', 'nombre_tipo_servicio', 'Nombre'),
	catalogo('tipos-servicio/nuevo', 'tipos-servicio', 'Tipos de servicio', 'Administra los tipos de reparación disponibles.', 'bi-tools', 'codigo_tipo_servicio', 'nombre_tipo_servicio', 'Nombre'),
	catalogo('tipos-servicio/:id/editar', 'tipos-servicio', 'Tipos de servicio', 'Administra los tipos de reparación disponibles.', 'bi-tools', 'codigo_tipo_servicio', 'nombre_tipo_servicio', 'Nombre'),
	catalogo('tipos-servicio/:id/eliminar', 'tipos-servicio', 'Tipos de servicio', 'Administra los tipos de reparación disponibles.', 'bi-tools', 'codigo_tipo_servicio', 'nombre_tipo_servicio', 'Nombre'),
	catalogo('estados-servicio', 'estados-servicio', 'Estados de servicio', 'Administra los estados de las reparaciones.', 'bi-clipboard-check', 'codigo_estado_servicio', 'nombre_estado_reparacion', 'Estado'),
	catalogo('estados-servicio/nuevo', 'estados-servicio', 'Estados de servicio', 'Administra los estados de las reparaciones.', 'bi-clipboard-check', 'codigo_estado_servicio', 'nombre_estado_reparacion', 'Estado'),
	catalogo('estados-servicio/:id/editar', 'estados-servicio', 'Estados de servicio', 'Administra los estados de las reparaciones.', 'bi-clipboard-check', 'codigo_estado_servicio', 'nombre_estado_reparacion', 'Estado'),
	catalogo('estados-servicio/:id/eliminar', 'estados-servicio', 'Estados de servicio', 'Administra los estados de las reparaciones.', 'bi-clipboard-check', 'codigo_estado_servicio', 'nombre_estado_reparacion', 'Estado'),
	// Las cuatro pantallas de seguridad usan componentes CRUD reales.
	{ path: 'seguridad/roles', component: RolesPage, canActivate: [authGuard] },
	{ path: 'seguridad/roles/nuevo', component: RolesPage, canActivate: [authGuard] },
	{ path: 'seguridad/roles/:id/editar', component: RolesPage, canActivate: [authGuard] },
	{ path: 'seguridad/roles/:id/eliminar', component: RolesPage, canActivate: [authGuard] },
	{ path: 'seguridad/perfiles', component: PerfilesPage, canActivate: [authGuard] },
	{ path: 'seguridad/perfiles/nuevo', component: PerfilesPage, canActivate: [authGuard] },
	{ path: 'seguridad/perfiles/:id/editar', component: PerfilesPage, canActivate: [authGuard] },
	{ path: 'seguridad/perfiles/:id/eliminar', component: PerfilesPage, canActivate: [authGuard] },
	{ path: 'seguridad/rutas', component: RutasPage, canActivate: [authGuard] },
	{ path: 'seguridad/rutas/nuevo', component: RutasPage, canActivate: [authGuard] },
	{ path: 'seguridad/rutas/:id/editar', component: RutasPage, canActivate: [authGuard] },
	{ path: 'seguridad/rutas/:id/eliminar', component: RutasPage, canActivate: [authGuard] },
	{ path: 'seguridad/permisos', component: PermisosPage, canActivate: [authGuard] },
	{ path: 'seguridad/permisos/nuevo', component: PermisosPage, canActivate: [authGuard] },
	{ path: 'seguridad/permisos/:id/editar', component: PermisosPage, canActivate: [authGuard] },
	{ path: 'seguridad/permisos/:id/eliminar', component: PermisosPage, canActivate: [authGuard] },
	{ path: 'seguridad', redirectTo: 'seguridad/roles', pathMatch: 'full' },
	{ path: '**', redirectTo: 'login' },
];
