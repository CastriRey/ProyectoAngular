import { Routes } from '@angular/router';
import { ClientesPage } from './clientes/clientes-page';
import { DashboardPage } from './dashboard/dashboard-page';
import { LoginPage } from './login/login-page';
import { authGuard } from './auth/auth.guard';
import { PermisosPage } from './seguridad/permisos/permisos-page';
import { PerfilesPage } from './seguridad/perfiles/perfiles-page';
import { RolesPage } from './seguridad/roles/roles-page';
import { RutasPage } from './seguridad/rutas/rutas-page';

export const routes: Routes = [
	// La ruta inicial siempre muestra el formulario de autenticación.
	{ path: '', redirectTo: 'login', pathMatch: 'full' },
	{ path: 'login', component: LoginPage },
	// El guard impide acceder al dashboard sin un token guardado.
	{ path: 'dashboard', component: DashboardPage, canActivate: [authGuard] },
	{ path: 'clientes', component: ClientesPage, canActivate: [authGuard] },
	// Las cuatro pantallas de seguridad quedan protegidas igual que el dashboard.
	{ path: 'seguridad/roles', component: RolesPage, canActivate: [authGuard] },
	{ path: 'seguridad/perfiles', component: PerfilesPage, canActivate: [authGuard] },
	{ path: 'seguridad/rutas', component: RutasPage, canActivate: [authGuard] },
	{ path: 'seguridad/permisos', component: PermisosPage, canActivate: [authGuard] },
	{ path: 'seguridad', redirectTo: 'seguridad/roles', pathMatch: 'full' },
	{ path: '**', redirectTo: 'login' },
];
