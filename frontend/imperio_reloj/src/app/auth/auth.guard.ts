import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs';

import { AuthService } from './auth.service';
import { PermissionService } from './permission.service';

// Un guard es una función que Angular ejecuta antes de entrar a una ruta protegida.
export const authGuard: CanActivateFn = (_route, state) => {
  const authService = inject(AuthService);
  const permissionService = inject(PermissionService);
  const router = inject(Router);

  if (!authService.estaAutenticado()) return router.createUrlTree(['/login']);
  return permissionService.puedeAcceder(state.url).pipe(
    map((permitido) => permitido ? true : router.createUrlTree(['/sin-permisos'])),
  );
};
