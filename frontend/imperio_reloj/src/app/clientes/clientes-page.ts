import { Component, inject, signal } from '@angular/core';

import { Cliente } from './cliente';
import { ClientesService } from './clientes.service';
import { NavComponent } from '../shared/nav/nav.component';

@Component({
  selector: 'app-clientes-page',
  imports: [NavComponent],
  templateUrl: './clientes-page.html',
})
export class ClientesPage {
  private readonly clientesService = inject(ClientesService);

  protected readonly clientes = signal<Cliente[]>([]);
  protected readonly cargando = signal(true);
  protected readonly error = signal('');

  constructor() {
    this.cargarClientes();
  }

  protected cargarClientes(): void {
    this.cargando.set(true);
    this.error.set('');

    this.clientesService.obtenerClientes().subscribe({
      next: (clientes) => {
        this.clientes.set(clientes);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No se pudo conectar con la API de clientes.');
        this.cargando.set(false);
      },
    });
  }
}
