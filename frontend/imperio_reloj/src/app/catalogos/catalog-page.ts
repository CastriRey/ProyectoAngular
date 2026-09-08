import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { NavComponent } from '../shared/nav/nav.component';
import { CatalogService } from './catalog.service';
import { CatalogoConfig, CatalogoRegistro } from './catalog.types';

@Component({
  selector: 'app-catalog-page',
  imports: [NavComponent, ReactiveFormsModule],
  templateUrl: './catalog-page.html',
})
export class CatalogPage {
  private readonly service = inject(CatalogService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected readonly config: CatalogoConfig = this.route.snapshot.data['catalogo'];
  protected readonly registros = signal<CatalogoRegistro[]>([]);
  protected readonly busqueda = signal('');
  protected readonly error = signal('');
  protected readonly cargando = signal(true);
  protected readonly guardando = signal(false);
  protected readonly formularioVisible = signal(false);
  protected readonly editandoId = signal<number | null>(null);
  protected readonly registrosFiltrados = computed(() => {
    const texto = this.busqueda().trim().toLowerCase();
    if (!texto) return this.registros();
    return this.registros().filter((registro) => String(registro[this.config.nameKey]).toLowerCase().includes(texto) || String(registro[this.config.idKey]).includes(texto));
  });
  protected readonly form = this.formBuilder.nonNullable.group({ nombre: ['', Validators.required] });

  constructor() {
    this.cargar();
    const id = this.route.snapshot.paramMap.get('id');
    if (this.route.snapshot.url[0]?.path === 'nuevo' || id) {
      this.formularioVisible.set(true);
      if (id) this.editar(Number(id));
    }
  }

  protected cargar(): void {
    this.cargando.set(true);
    this.service.listar(this.config.recurso).subscribe({
      next: (registros) => { this.registros.set(registros); this.cargando.set(false); },
      error: () => { this.error.set(`No se pudieron cargar ${this.config.titulo.toLowerCase()}.`); this.cargando.set(false); },
    });
  }

  protected actualizarBusqueda(event: Event): void {
    this.busqueda.set((event.target as HTMLInputElement).value);
  }

  protected nuevo(): void {
    this.editandoId.set(null);
    this.form.reset({ nombre: '' });
    this.formularioVisible.set(true);
    void this.router.navigate([this.config.rutaNuevo]);
  }

  protected editar(registro: CatalogoRegistro | number): void {
    const id = typeof registro === 'number' ? registro : Number(registro[this.config.idKey]);
    const item = typeof registro === 'number' ? this.registros().find((actual) => Number(actual[this.config.idKey]) === id) : registro;
    if (!item) return;
    this.editandoId.set(id);
    this.form.patchValue({ nombre: String(item[this.config.nameKey]) });
    this.formularioVisible.set(true);
    void this.router.navigate([this.config.rutaLista, id, 'editar']);
  }

  protected guardar(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.guardando.set(true);
    const data = { [this.config.nameKey]: this.form.controls.nombre.value };
    const request = this.editandoId() === null
      ? this.service.crear(this.config.recurso, data)
      : this.service.actualizar(this.config.recurso, this.editandoId()!, data);
    request.subscribe({
      next: () => this.cancelar(),
      error: () => { this.error.set(`No se pudo guardar ${this.config.titulo.toLowerCase()}.`); this.guardando.set(false); },
    });
  }

  protected eliminar(registro: CatalogoRegistro): void {
    const id = Number(registro[this.config.idKey]);
    if (!confirm(`¿Eliminar "${registro[this.config.nameKey]}"?`)) return;
    this.service.eliminar(this.config.recurso, id).subscribe({
      next: () => this.cargar(),
      error: () => this.error.set(`No se pudo eliminar ${this.config.titulo.toLowerCase()}.`),
    });
  }

  protected cancelar(): void {
    this.formularioVisible.set(false);
    this.editandoId.set(null);
    this.guardando.set(false);
    this.form.reset({ nombre: '' });
    void this.router.navigate([this.config.rutaLista]);
    this.cargar();
  }
}
