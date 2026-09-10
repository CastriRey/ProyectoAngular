import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { NavComponent } from '../nav/nav.component';

@Component({
  selector: 'app-module-page',
  imports: [NavComponent, RouterLink],
  templateUrl: './module-page.html',
  styleUrl: './module-page.css',
})
export class ModulePage {
  private readonly route = inject(ActivatedRoute);

  // La ruta entrega estos datos para reutilizar la misma estructura en cada módulo.
  protected readonly titulo = this.route.snapshot.data['titulo'] as string;
  protected readonly descripcion = this.route.snapshot.data['descripcion'] as string;
  protected readonly tipo = this.route.snapshot.data['tipo'] as string;
  protected readonly rutaLista = this.route.snapshot.data['rutaLista'] as string;
  protected readonly rutaNuevo = this.route.snapshot.data['rutaNuevo'] as string | null;
  protected readonly columnas = (this.route.snapshot.data['columnas'] as string[]) ?? [];

  protected readonly esFormulario = this.tipo === 'formulario';
  protected readonly esConfirmacion = this.tipo === 'confirmacion';
  protected readonly esDetalle = this.tipo === 'detalle';
}
