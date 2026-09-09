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
import { VentasPage } from './ventas/ventas-page';
import { ServiciosPage } from './servicios/servicios-page';
import { RelojesClientesPage } from './relojes-clientes/relojes-clientes-page';
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
	recurso: 'marcas' | 'metodos-pago' | 'tipos-producto' | 'tipos-servicio' | 'estados-servicio',
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
	{ path: 'relojes-clientes', component: RelojesClientesPage, canActivate: [authGuard] },
	{ path: 'relojes-clientes/nuevo', component: RelojesClientesPage, canActivate: [authGuard] },
	{ path: 'relojes-clientes/:id/editar', component: RelojesClientesPage, canActivate: [authGuard] },
	{ path: 'relojes-clientes/:id/eliminar', component: RelojesClientesPage, canActivate: [authGuard] },
	{ path: 'productos', component: ProductosPage, canActivate: [authGuard] },
	{ path: 'productos/nuevo', component: ProductosPage, canActivate: [authGuard] },
	{ path: 'productos/:id/editar', component: ProductosPage, canActivate: [authGuard] },
	{ path: 'productos/:id/eliminar', component: ProductosPage, canActivate: [authGuard] },
	catalogo('marcas', 'marcas', 'Marcas', 'Administra las marcas de productos.', 'bi-bookmark-star', 'codigo_marca', 'nombre_marca', 'Nombre'),
	catalogo('marcas/nuevo', 'marcas', 'Marcas', 'Administra las marcas de productos.', 'bi-bookmark-star', 'codigo_marca', 'nombre_marca', 'Nombre'),
	catalogo('marcas/:id/editar', 'marcas', 'Marcas', 'Administra las marcas de productos.', 'bi-bookmark-star', 'codigo_marca', 'nombre_marca', 'Nombre'),
	catalogo('marcas/:id/eliminar', 'marcas', 'Marcas', 'Administra las marcas de productos.', 'bi-bookmark-star', 'codigo_marca', 'nombre_marca', 'Nombre'),
	catalogo('tipos-producto', 'tipos-producto', 'Tipos de producto', 'Administra las categorías de productos.', 'bi-tags', 'codigo_tipo_producto', 'nombre_tipo_producto', 'Nombre'),
	catalogo('tipos-producto/nuevo', 'tipos-producto', 'Tipos de producto', 'Administra las categorías de productos.', 'bi-tags', 'codigo_tipo_producto', 'nombre_tipo_producto', 'Nombre'),
	catalogo('tipos-producto/:id/editar', 'tipos-producto', 'Tipos de producto', 'Administra las categorías de productos.', 'bi-tags', 'codigo_tipo_producto', 'nombre_tipo_producto', 'Nombre'),
	catalogo('tipos-producto/:id/eliminar', 'tipos-producto', 'Tipos de producto', 'Administra las categorías de productos.', 'bi-tags', 'codigo_tipo_producto', 'nombre_tipo_producto', 'Nombre'),
	catalogo('metodos-pago', 'metodos-pago', 'Métodos de pago', 'Administra las formas de pago.', 'bi-credit-card', 'codigo_metodo_pago', 'nombre_metodo_pago', 'Nombre'),
	catalogo('metodos-pago/nuevo', 'metodos-pago', 'Métodos de pago', 'Administra las formas de pago.', 'bi-credit-card', 'codigo_metodo_pago', 'nombre_metodo_pago', 'Nombre'),
	catalogo('metodos-pago/:id/editar', 'metodos-pago', 'Métodos de pago', 'Administra las formas de pago.', 'bi-credit-card', 'codigo_metodo_pago', 'nombre_metodo_pago', 'Nombre'),
	catalogo('metodos-pago/:id/eliminar', 'metodos-pago', 'Métodos de pago', 'Administra las formas de pago.', 'bi-credit-card', 'codigo_metodo_pago', 'nombre_metodo_pago', 'Nombre'),
	{ path: 'ventas', component: VentasPage, canActivate: [authGuard] },
	{ path: 'ventas/crear', component: VentasPage, canActivate: [authGuard] },
	{ path: 'ventas/nueva', redirectTo: 'ventas/crear', pathMatch: 'full' },
	{ path: 'ventas/:id', component: VentasPage, canActivate: [authGuard] },
	{ path: 'servicios', component: ServiciosPage, canActivate: [authGuard] },
	{ path: 'servicios/finalizados', component: ServiciosPage, canActivate: [authGuard] },
	{ path: 'servicios/nuevo', component: ServiciosPage, canActivate: [authGuard] },
	{ path: 'servicios/:id/editar', component: ServiciosPage, canActivate: [authGuard] },
	{ path: 'servicios/:id/eliminar', component: ServiciosPage, canActivate: [authGuard] },
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
