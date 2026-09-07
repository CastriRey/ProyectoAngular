import { Route, Routes } from '@angular/router';
import { ClientesPage } from './clientes/clientes-page';
import { DashboardPage } from './dashboard/dashboard-page';
import { LoginPage } from './login/login-page';
import { authGuard } from './auth/auth.guard';
import { PermisosPage } from './seguridad/permisos/permisos-page';
import { PerfilesPage } from './seguridad/perfiles/perfiles-page';
import { RolesPage } from './seguridad/roles/roles-page';
import { RutasPage } from './seguridad/rutas/rutas-page';
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

export const routes: Routes = [
	// La ruta inicial siempre muestra el formulario de autenticación.
	{ path: '', redirectTo: 'login', pathMatch: 'full' },
	{ path: 'login', component: LoginPage },
	// El guard impide acceder al dashboard sin un token guardado.
	{ path: 'dashboard', component: DashboardPage, canActivate: [authGuard] },
	{ path: 'clientes', component: ClientesPage, canActivate: [authGuard] },
	modulo('empleados', 'Empleados', 'Administra los empleados del sistema.', {
		tipo: 'lista', rutaLista: '/empleados', rutaNuevo: '/empleados/nuevo', columnas: ['Código', 'Nombre', 'Correo'],
	}),
	modulo('empleados/nuevo', 'Nuevo empleado', 'Registra un empleado del sistema.', {
		tipo: 'formulario', rutaLista: '/empleados', rutaNuevo: null, columnas: [],
	}),
	modulo('empleados/:id/editar', 'Editar empleado', 'Actualiza la información del empleado.', {
		tipo: 'formulario', rutaLista: '/empleados', rutaNuevo: null, columnas: [],
	}),
	modulo('empleados/:id/eliminar', 'Eliminar empleado', 'Confirma la eliminación del empleado.', {
		tipo: 'confirmacion', rutaLista: '/empleados', rutaNuevo: null, columnas: [],
	}),
	modulo('clientes/nuevo', 'Nuevo cliente', 'Registra un cliente de la tienda.', {
		tipo: 'formulario', rutaLista: '/clientes', rutaNuevo: null, columnas: [],
	}),
	modulo('clientes/:id/editar', 'Editar cliente', 'Actualiza la información del cliente.', {
		tipo: 'formulario', rutaLista: '/clientes', rutaNuevo: null, columnas: [],
	}),
	modulo('clientes/:id/eliminar', 'Eliminar cliente', 'Confirma la eliminación del cliente.', {
		tipo: 'confirmacion', rutaLista: '/clientes', rutaNuevo: null, columnas: [],
	}),
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
	modulo('productos', 'Productos', 'Administra el inventario de productos.', {
		tipo: 'lista', rutaLista: '/productos', rutaNuevo: '/productos/nuevo', columnas: ['Código', 'Nombre', 'Precio', 'Stock'],
	}),
	modulo('productos/nuevo', 'Nuevo producto', 'Registra un producto en el inventario.', {
		tipo: 'formulario', rutaLista: '/productos', rutaNuevo: null, columnas: [],
	}),
	modulo('productos/:id/editar', 'Editar producto', 'Actualiza la información del producto.', {
		tipo: 'formulario', rutaLista: '/productos', rutaNuevo: null, columnas: [],
	}),
	modulo('productos/:id/eliminar', 'Eliminar producto', 'Confirma la eliminación del producto.', {
		tipo: 'confirmacion', rutaLista: '/productos', rutaNuevo: null, columnas: [],
	}),
	modulo('marcas', 'Marcas', 'Administra las marcas de productos.', {
		tipo: 'lista', rutaLista: '/marcas', rutaNuevo: '/marcas/nuevo', columnas: ['Código', 'Nombre'],
	}),
	modulo('marcas/nuevo', 'Nueva marca', 'Registra una marca.', {
		tipo: 'formulario', rutaLista: '/marcas', rutaNuevo: null, columnas: [],
	}),
	modulo('marcas/:id/editar', 'Editar marca', 'Actualiza una marca.', {
		tipo: 'formulario', rutaLista: '/marcas', rutaNuevo: null, columnas: [],
	}),
	modulo('marcas/:id/eliminar', 'Eliminar marca', 'Confirma la eliminación de la marca.', {
		tipo: 'confirmacion', rutaLista: '/marcas', rutaNuevo: null, columnas: [],
	}),
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
	modulo('metodos-pago', 'Métodos de pago', 'Administra las formas de pago.', {
		tipo: 'lista', rutaLista: '/metodos-pago', rutaNuevo: '/metodos-pago/nuevo', columnas: ['Código', 'Nombre'],
	}),
	modulo('metodos-pago/nuevo', 'Nuevo método de pago', 'Registra una forma de pago.', {
		tipo: 'formulario', rutaLista: '/metodos-pago', rutaNuevo: null, columnas: [],
	}),
	modulo('metodos-pago/:id/editar', 'Editar método de pago', 'Actualiza una forma de pago.', {
		tipo: 'formulario', rutaLista: '/metodos-pago', rutaNuevo: null, columnas: [],
	}),
	modulo('metodos-pago/:id/eliminar', 'Eliminar método de pago', 'Confirma la eliminación de la forma de pago.', {
		tipo: 'confirmacion', rutaLista: '/metodos-pago', rutaNuevo: null, columnas: [],
	}),
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
	modulo('tipos-servicio', 'Tipos de servicio', 'Administra los tipos de reparación disponibles.', {
		tipo: 'lista', rutaLista: '/tipos-servicio', rutaNuevo: '/tipos-servicio/nuevo', columnas: ['Código', 'Nombre'],
	}),
	modulo('tipos-servicio/nuevo', 'Nuevo tipo de servicio', 'Registra un tipo de reparación.', {
		tipo: 'formulario', rutaLista: '/tipos-servicio', rutaNuevo: null, columnas: [],
	}),
	modulo('tipos-servicio/:id/editar', 'Editar tipo de servicio', 'Actualiza un tipo de reparación.', {
		tipo: 'formulario', rutaLista: '/tipos-servicio', rutaNuevo: null, columnas: [],
	}),
	modulo('tipos-servicio/:id/eliminar', 'Eliminar tipo de servicio', 'Confirma la eliminación del tipo de servicio.', {
		tipo: 'confirmacion', rutaLista: '/tipos-servicio', rutaNuevo: null, columnas: [],
	}),
	modulo('estados-servicio', 'Estados de servicio', 'Administra los estados de las reparaciones.', {
		tipo: 'lista', rutaLista: '/estados-servicio', rutaNuevo: '/estados-servicio/nuevo', columnas: ['Código', 'Estado'],
	}),
	modulo('estados-servicio/nuevo', 'Nuevo estado de servicio', 'Registra un estado para las reparaciones.', {
		tipo: 'formulario', rutaLista: '/estados-servicio', rutaNuevo: null, columnas: [],
	}),
	modulo('estados-servicio/:id/editar', 'Editar estado de servicio', 'Actualiza un estado de reparación.', {
		tipo: 'formulario', rutaLista: '/estados-servicio', rutaNuevo: null, columnas: [],
	}),
	modulo('estados-servicio/:id/eliminar', 'Eliminar estado de servicio', 'Confirma la eliminación del estado.', {
		tipo: 'confirmacion', rutaLista: '/estados-servicio', rutaNuevo: null, columnas: [],
	}),
	// Las cuatro pantallas de seguridad quedan protegidas igual que el dashboard.
	{ path: 'seguridad/roles', component: RolesPage, canActivate: [authGuard] },
	{ path: 'seguridad/perfiles', component: PerfilesPage, canActivate: [authGuard] },
	{ path: 'seguridad/rutas', component: RutasPage, canActivate: [authGuard] },
	{ path: 'seguridad/permisos', component: PermisosPage, canActivate: [authGuard] },
	{ path: 'seguridad', redirectTo: 'seguridad/roles', pathMatch: 'full' },
	modulo('seguridad/roles/nuevo', 'Nuevo rol', 'Crea un rol de seguridad.', {
		tipo: 'formulario', rutaLista: '/seguridad/roles', rutaNuevo: null, columnas: [],
	}),
	modulo('seguridad/roles/:id/editar', 'Editar rol', 'Actualiza un rol de seguridad.', {
		tipo: 'formulario', rutaLista: '/seguridad/roles', rutaNuevo: null, columnas: [],
	}),
	modulo('seguridad/roles/:id/eliminar', 'Eliminar rol', 'Confirma la eliminación del rol.', {
		tipo: 'confirmacion', rutaLista: '/seguridad/roles', rutaNuevo: null, columnas: [],
	}),
	modulo('seguridad/perfiles/nuevo', 'Nuevo perfil', 'Crea un perfil y asígnale un rol.', {
		tipo: 'formulario', rutaLista: '/seguridad/perfiles', rutaNuevo: null, columnas: [],
	}),
	modulo('seguridad/perfiles/:id/editar', 'Editar perfil', 'Actualiza un perfil de seguridad.', {
		tipo: 'formulario', rutaLista: '/seguridad/perfiles', rutaNuevo: null, columnas: [],
	}),
	modulo('seguridad/perfiles/:id/eliminar', 'Eliminar perfil', 'Confirma la eliminación del perfil.', {
		tipo: 'confirmacion', rutaLista: '/seguridad/perfiles', rutaNuevo: null, columnas: [],
	}),
	modulo('seguridad/rutas/nuevo', 'Nueva ruta', 'Crea una ruta protegida.', {
		tipo: 'formulario', rutaLista: '/seguridad/rutas', rutaNuevo: null, columnas: [],
	}),
	modulo('seguridad/rutas/:id/editar', 'Editar ruta', 'Actualiza una ruta protegida.', {
		tipo: 'formulario', rutaLista: '/seguridad/rutas', rutaNuevo: null, columnas: [],
	}),
	modulo('seguridad/rutas/:id/eliminar', 'Eliminar ruta', 'Confirma la eliminación de la ruta.', {
		tipo: 'confirmacion', rutaLista: '/seguridad/rutas', rutaNuevo: null, columnas: [],
	}),
	modulo('seguridad/permisos/nuevo', 'Nuevo permiso', 'Asigna acciones de un perfil sobre una ruta.', {
		tipo: 'formulario', rutaLista: '/seguridad/permisos', rutaNuevo: null, columnas: [],
	}),
	modulo('seguridad/permisos/:id/editar', 'Editar permiso', 'Actualiza las acciones permitidas.', {
		tipo: 'formulario', rutaLista: '/seguridad/permisos', rutaNuevo: null, columnas: [],
	}),
	modulo('seguridad/permisos/:id/eliminar', 'Eliminar permiso', 'Confirma la eliminación del permiso.', {
		tipo: 'confirmacion', rutaLista: '/seguridad/permisos', rutaNuevo: null, columnas: [],
	}),
	{ path: '**', redirectTo: 'login' },
];
