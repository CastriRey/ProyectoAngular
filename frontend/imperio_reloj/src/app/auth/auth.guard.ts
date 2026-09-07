import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from './auth.service';

// Un guard es una función que Angular ejecuta antes de entrar a una ruta protegida.
export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.estaAutenticado()
    ? true
    : router.createUrlTree(['/login']);
};
