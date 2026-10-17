import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { map } from 'rxjs';

import { AuthService } from './auth.service';
import { PermissionService } from './permission.service';

export const permissionGuard: CanActivateFn = (_route, state) => {
  const authService = inject(AuthService);
  const permissionService = inject(PermissionService);
  const router = inject(Router);

  if (!authService.estaAutenticado()) return router.createUrlTree(['/login']);
  return permissionService.puedeAcceder(state.url).pipe(
    // Una ruta sin permiso no se renderiza; el usuario vuelve al dashboard.
    map((permitido) => permitido ? true : router.createUrlTree(['/dashboard'])),
  );
};
