import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin } from 'rxjs';

import { NavComponent } from '../shared/nav/nav.component';
import { ClienteOption, MarcaOption, RelojCliente } from './reloj-cliente';
import { RelojesClientesService } from './relojes-clientes.service';

@Component({
  selector: 'app-relojes-clientes-page',
  imports: [NavComponent, ReactiveFormsModule],
  templateUrl: './relojes-clientes-page.html',
  styleUrl: './relojes-clientes-page.css',
})
export class RelojesClientesPage {
  private readonly service = inject(RelojesClientesService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected readonly relojes = signal<RelojCliente[]>([]);
  protected readonly clientes = signal<ClienteOption[]>([]);
  protected readonly marcas = signal<MarcaOption[]>([]);
  protected readonly cargando = signal(true);
  protected readonly guardando = signal(false);
  protected readonly formularioVisible = signal(false);
  protected readonly editandoId = signal<number | null>(null);
  protected readonly error = signal('');
  protected readonly busqueda = signal('');
  protected readonly clienteSeleccionado = signal<ClienteOption | null>(null);
  protected readonly relojesFiltrados = computed(() => {
    const texto = this.busqueda().trim().toLowerCase();
    if (!texto) return this.relojes();
    return this.relojes().filter((reloj) => `${reloj.codigo_reloj_cliente} ${reloj.marca_nombre ?? ''} ${reloj.modelo} ${reloj.descripcion_reloj ?? ''} ${reloj.cliente_nombre ?? ''}`.toLowerCase().includes(texto));
  });
  protected readonly form = this.formBuilder.nonNullable.group({
    codigo_cliente: [0, [Validators.required, Validators.min(1)]],
    codigo_marca: [0, [Validators.required, Validators.min(1)]],
    modelo: ['', Validators.required],
    descripcion_reloj: [''],
  });

  constructor() {
    this.cargarDatos();
    const clienteId = Number(this.route.snapshot.queryParamMap.get('cliente')) || 0;
    const relojId = Number(this.route.snapshot.paramMap.get('id')) || 0;
    if (clienteId) this.form.controls.codigo_cliente.setValue(clienteId);
    if (this.route.snapshot.url[0]?.path === 'nuevo') this.nuevo(clienteId);
    if (relojId) this.editarPorId(relojId);
  }

  protected cargarDatos(): void {
    this.cargando.set(true);
    forkJoin({ relojes: this.service.obtenerRelojes(), clientes: this.service.obtenerClientes(), marcas: this.service.obtenerMarcas() }).subscribe({
      next: ({ relojes, clientes, marcas }) => {
        this.relojes.set(relojes);
        this.clientes.set(clientes);
        this.marcas.set(marcas);
        this.cargando.set(false);
        const id = Number(this.route.snapshot.paramMap.get('id')) || 0;
        if (id) {
          const reloj = relojes.find((item) => item.codigo_reloj_cliente === id);
          if (reloj) this.editar(reloj);
        } else {
          this.actualizarClienteSeleccionado();
        }
      },
      error: () => { this.error.set('No se pudieron cargar los relojes, clientes y marcas.'); this.cargando.set(false); },
    });
  }

  protected actualizarBusqueda(event: Event): void { this.busqueda.set((event.target as HTMLInputElement).value); }
  protected actualizarClienteSeleccionado(): void { this.clienteSeleccionado.set(this.clientes().find((cliente) => cliente.identificacion_cliente === this.form.controls.codigo_cliente.value) ?? null); }
  protected nuevo(clienteId = 0): void { this.editandoId.set(null); this.form.reset({ codigo_cliente: clienteId, codigo_marca: 0, modelo: '', descripcion_reloj: '' }); this.formularioVisible.set(true); void this.router.navigate(['/relojes-clientes/nuevo'], clienteId ? { queryParams: { cliente: clienteId } } : undefined); }
  protected editar(reloj: RelojCliente): void { this.editandoId.set(reloj.codigo_reloj_cliente); this.form.patchValue({ codigo_cliente: reloj.codigo_cliente, codigo_marca: reloj.codigo_marca, modelo: reloj.modelo, descripcion_reloj: reloj.descripcion_reloj ?? '' }); this.actualizarClienteSeleccionado(); this.formularioVisible.set(true); void this.router.navigate(['/relojes-clientes', reloj.codigo_reloj_cliente, 'editar']); }
  private editarPorId(id: number): void { const reloj = this.relojes().find((item) => item.codigo_reloj_cliente === id); if (reloj) this.editar(reloj); else this.editandoId.set(id); }
  protected guardar(): void { if (this.form.invalid) { this.form.markAllAsTouched(); return; } this.guardando.set(true); const datos = this.form.getRawValue(); const request = this.editandoId() === null ? this.service.crearReloj(datos) : this.service.actualizarReloj(this.editandoId()!, datos); request.subscribe({ next: () => this.cancelar(), error: (respuesta) => { const detalle = respuesta.error && typeof respuesta.error === 'object' ? Object.values(respuesta.error).flat().join(' ') : ''; this.error.set(detalle || 'No se pudo guardar el reloj.'); this.guardando.set(false); } }); }
  protected eliminar(reloj: RelojCliente): void { if (!confirm(`¿Eliminar el reloj ${reloj.codigo_reloj_cliente}?`)) return; this.service.eliminarReloj(reloj.codigo_reloj_cliente).subscribe({ next: () => this.cargarDatos(), error: () => this.error.set('No se pudo eliminar el reloj.') }); }
  protected cancelar(): void { this.formularioVisible.set(false); this.editandoId.set(null); this.guardando.set(false); this.form.reset({ codigo_cliente: 0, codigo_marca: 0, modelo: '', descripcion_reloj: '' }); void this.router.navigate(['/relojes-clientes']); this.cargarDatos(); }
}
