import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { AuthService } from '../auth/auth.service';
import { NavComponent } from '../shared/nav/nav.component';

@Component({
  selector: 'app-dashboard-page',
  imports: [RouterLink, NavComponent],
  templateUrl: './dashboard-page.html',
  styleUrls: ['./dashboard-page.css'],
})
export class DashboardPage {
  protected readonly authService = inject(AuthService);
  // El servicio oculta la diferencia entre navegador y renderizado SSR.
  protected readonly nombre = this.authService.obtenerNombreUsuario();
}
