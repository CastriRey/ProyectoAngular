import { Component, inject } from '@angular/core';

import { AuthService } from './auth.service';

@Component({
  selector: 'app-no-permissions-page',
  imports: [],
  template: `
    <main class="no-permissions-page">
      <section class="no-permissions-card">
        <i class="bi bi-shield-lock" aria-hidden="true"></i>
        <h1>Sin permisos</h1>
        <p>Tu usuario no tiene permisos para acceder a ninguna sección del sistema.</p>
        <button type="button" (click)="cerrarSesion()">Cerrar sesión</button>
      </section>
    </main>
  `,
  styles: [`
    :host { display: block; min-height: 100vh; background: #f5f7fa; }
    .no-permissions-page { display: grid; min-height: 100vh; place-items: center; padding: 24px; }
    .no-permissions-card { width: min(100%, 460px); padding: 42px 32px; border-radius: 18px; background: #fff; box-shadow: 0 6px 20px rgba(0,0,0,.08); text-align: center; color: #1f2937; }
    .no-permissions-card i { color: #dc3545; font-size: 3rem; }
    .no-permissions-card h1 { margin: 16px 0 8px; }
    .no-permissions-card p { margin: 0 0 24px; color: #6b7280; }
    .no-permissions-card button { border: 0; border-radius: 10px; padding: 11px 20px; background: #2563eb; color: #fff; font: inherit; font-weight: 700; cursor: pointer; }
  `],
})
export class NoPermissionsPage {
  private readonly authService = inject(AuthService);

  protected cerrarSesion(): void {
    this.authService.cerrarSesion();
  }
}
