import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { NavComponent } from '../../shared/nav/nav.component';
import { Ruta } from '../security.types';
import { SecurityService } from '../security.service';

@Component({
  selector: 'app-rutas-page',
  imports: [NavComponent, ReactiveFormsModule],
  templateUrl: './rutas-page.html',
})
export class RutasPage {
  private readonly service = inject(SecurityService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected readonly rutas = signal<Ruta[]>([]);
  protected readonly error = signal('');
  protected readonly formularioVisible = signal(false);
  protected readonly editandoId = signal<number | null>(null);
  protected readonly guardando = signal(false);
  protected readonly form = this.formBuilder.nonNullable.group({
    nombre_ruta: ['', Validators.required],
    url_ruta: ['', Validators.required],
    nodo_ruta: ['S', Validators.required],
    padre_ruta: [null as number | null],
    orden_ruta: [0, Validators.min(0)],
  });

  constructor() {
    this.cargar();
    const id = this.route.snapshot.paramMap.get('id');
    if (this.route.snapshot.url[0]?.path === 'nuevo' || id) {
      this.formularioVisible.set(true);
      if (id) this.editar(Number(id));
    }
  }

  protected cargar(): void { this.service.rutas().subscribe({ next: (items) => this.rutas.set(items), error: () => this.error.set('No se pudieron cargar las rutas.') }); }

  protected nuevo(): void {
    this.editandoId.set(null);
    this.form.reset({ nombre_ruta: '', url_ruta: '', nodo_ruta: 'S', padre_ruta: null, orden_ruta: 0 });
    this.formularioVisible.set(true);
    void this.router.navigate(['/seguridad/rutas/nuevo']);
  }

  protected editar(rutaOrId: Ruta | number): void {
    const id = typeof rutaOrId === 'number' ? rutaOrId : rutaOrId.codigo_ruta;
    const ruta = typeof rutaOrId === 'number' ? this.rutas().find((item) => item.codigo_ruta === id) : rutaOrId;
    if (!ruta) return;
    this.editandoId.set(id);
    this.form.patchValue({ nombre_ruta: ruta.nombre_ruta, url_ruta: ruta.url_ruta, nodo_ruta: ruta.nodo_ruta, padre_ruta: ruta.padre_ruta, orden_ruta: ruta.orden_ruta });
    this.formularioVisible.set(true);
    void this.router.navigate(['/seguridad/rutas', id, 'editar']);
  }

  protected guardar(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.guardando.set(true);
    const request = this.editandoId() === null ? this.service.crearRuta(this.form.getRawValue()) : this.service.actualizarRuta(this.editandoId()!, this.form.getRawValue());
    request.subscribe({ next: () => this.cancelar(), error: () => { this.error.set('No se pudo guardar la ruta.'); this.guardando.set(false); } });
  }

  protected eliminar(ruta: Ruta): void {
    if (!confirm(`¿Eliminar la ruta "${ruta.url_ruta}"?`)) return;
    this.service.eliminarRuta(ruta.codigo_ruta).subscribe({ next: () => this.cargar(), error: () => this.error.set('No se pudo eliminar la ruta.') });
  }

  protected cancelar(): void {
    this.formularioVisible.set(false);
    this.editandoId.set(null);
    this.guardando.set(false);
    void this.router.navigate(['/seguridad/rutas']);
    this.cargar();
  }
}
