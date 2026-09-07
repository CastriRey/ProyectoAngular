import { Component, HostListener, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-nav',
  imports: [RouterLink, RouterLinkActive],
  styleUrl: './nav.component.css',
  templateUrl: './nav.component.html',
})
export class NavComponent {
  // El servicio permite cerrar la sesión desde cualquier página que use este nav.
  protected readonly authService = inject(AuthService);

  // El nombre se obtiene de la sesión guardada después del login.
  protected readonly nombreUsuario = this.authService.obtenerNombreUsuario();

  // Solo un menú puede estar abierto al mismo tiempo.
  protected readonly menuAbierto = signal<string | null>(null);
  protected readonly menuMovilAbierto = signal(false);

  protected alternarMenuMovil(event: Event): void {
    // El panel móvil es independiente de los desplegables de cada módulo.
    event.stopPropagation();
    this.menuMovilAbierto.update((abierto) => !abierto);
  }

  protected alternarMenu(menu: string, event: Event): void {
    // Evita que el clic del botón llegue al listener global y cierre el menú enseguida.
    event.stopPropagation();
    this.menuAbierto.update((menuActual) => menuActual === menu ? null : menu);
  }

  protected cerrarMenus(): void {
    this.menuAbierto.set(null);
  }

  // Cualquier clic fuera del nav cierra el menú abierto.
  @HostListener('document:click')
  protected alHacerClickEnDocumento(): void {
    this.cerrarMenus();
  }
}
