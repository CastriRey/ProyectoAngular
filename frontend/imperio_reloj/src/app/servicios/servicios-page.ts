import { Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin } from 'rxjs';

import { Empleado } from '../empleados/empleado';
import { NavComponent } from '../shared/nav/nav.component';
import { EstadoServicioOption, RelojCliente, Servicio, TipoServicioOption } from './servicio';
import { ServiciosService } from './servicios.service';

@Component({
  selector: 'app-servicios-page',
  imports: [NavComponent, ReactiveFormsModule, DatePipe],
  templateUrl: './servicios-page.html',
})
export class ServiciosPage {
  private readonly service = inject(ServiciosService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected readonly servicios = signal<Servicio[]>([]);
  protected readonly empleados = signal<Empleado[]>([]);
  protected readonly tipos = signal<TipoServicioOption[]>([]);
  protected readonly estados = signal<EstadoServicioOption[]>([]);
  protected readonly relojes = signal<RelojCliente[]>([]);
  protected readonly cargando = signal(true);
  protected readonly guardando = signal(false);
  protected readonly formularioVisible = signal(false);
  protected readonly editandoId = signal<number | null>(null);
  protected readonly error = signal('');
  protected readonly busqueda = signal('');
  protected readonly finalizados = signal(false);
  protected readonly serviciosFiltrados = computed(() => {
    const texto = this.busqueda().trim().toLowerCase();
    return this.servicios().filter((servicio) => !texto || `${servicio.codigo_servicio} ${servicio.tecnico_nombre ?? ''} ${servicio.cliente_nombre ?? ''} ${servicio.tipo_servicio_nombre ?? ''} ${servicio.estado_servicio_nombre ?? ''} ${servicio.reloj_cliente_nombre ?? ''} ${servicio.descripcion_falla}`.toLowerCase().includes(texto));
  });
  protected readonly form = this.formBuilder.nonNullable.group({
    codigo_servicio: [0],
    codigo_tecnico: [0, [Validators.required, Validators.min(1)]],
    codigo_tipo_servicio: [0, [Validators.required, Validators.min(1)]],
    codigo_estado_servicio: [0, [Validators.required, Validators.min(1)]],
    codigo_reloj_cliente: [0, [Validators.required, Validators.min(1)]],
    codigo_detalle_venta: [null as number | null],
    fecha_servicio: ['', Validators.required],
    descripcion_falla: ['', Validators.required],
  });

  constructor() {
    this.finalizados.set(this.route.snapshot.url[0]?.path === 'finalizados');
    this.cargarDatos();
    const id = this.route.snapshot.paramMap.get('id');
    if (this.route.snapshot.url[0]?.path === 'nuevo') this.nuevo();
    if (id) { this.editandoId.set(Number(id)); this.formularioVisible.set(true); }
  }

  protected cargarDatos(): void {
    this.cargando.set(true);
    forkJoin({ servicios: this.service.obtenerServicios(), empleados: this.service.obtenerEmpleados(), tipos: this.service.obtenerTipos(), estados: this.service.obtenerEstados(), relojes: this.service.obtenerRelojes() }).subscribe({
      next: (datos) => {
        const servicios = this.finalizados() ? datos.servicios.filter((servicio) => servicio.estado_servicio_nombre?.toLowerCase().includes('final') || servicio.estado_servicio_nombre?.toLowerCase().includes('entreg')) : datos.servicios;
        this.servicios.set(servicios);
        this.empleados.set(datos.empleados); this.tipos.set(datos.tipos); this.estados.set(datos.estados); this.relojes.set(datos.relojes); this.cargando.set(false);
        const id = this.editandoId();
        if (id !== null) { const servicio = datos.servicios.find((item) => item.codigo_servicio === id); if (servicio) this.cargarEnFormulario(servicio); }
      },
      error: () => { this.error.set('No se pudieron cargar los servicios y sus opciones.'); this.cargando.set(false); },
    });
  }

  protected actualizarBusqueda(event: Event): void { this.busqueda.set((event.target as HTMLInputElement).value); }
  protected nuevo(): void { this.editandoId.set(null); this.form.reset({ codigo_servicio: 0, codigo_tecnico: 0, codigo_tipo_servicio: 0, codigo_estado_servicio: 0, codigo_reloj_cliente: 0, codigo_detalle_venta: null, fecha_servicio: new Date().toISOString().slice(0, 16), descripcion_falla: '' }); this.formularioVisible.set(true); void this.router.navigate(['/servicios/nuevo']); }
  protected editar(servicio: Servicio): void { this.editandoId.set(servicio.codigo_servicio); this.cargarEnFormulario(servicio); this.formularioVisible.set(true); void this.router.navigate(['/servicios', servicio.codigo_servicio, 'editar']); }
  private cargarEnFormulario(servicio: Servicio): void { this.form.patchValue({ ...servicio, fecha_servicio: servicio.fecha_servicio ? servicio.fecha_servicio.slice(0, 16) : '' }); }
  protected guardar(): void { if (this.form.invalid) { this.form.markAllAsTouched(); return; } this.guardando.set(true); const datos = this.form.getRawValue(); const request = this.editandoId() === null ? this.service.crearServicio(datos) : this.service.actualizarServicio(this.editandoId()!, datos); request.subscribe({ next: () => this.cancelar(), error: (respuesta) => { const detalle = respuesta.error && typeof respuesta.error === 'object' ? Object.values(respuesta.error).flat().join(' ') : ''; this.error.set(detalle || 'No se pudo guardar el servicio.'); this.guardando.set(false); } }); }
  protected eliminar(servicio: Servicio): void { if (!confirm(`¿Eliminar el servicio #${servicio.codigo_servicio}?`)) return; this.service.eliminarServicio(servicio.codigo_servicio).subscribe({ next: () => this.cargarDatos(), error: () => this.error.set('No se pudo eliminar el servicio.') }); }
  protected cancelar(): void { this.formularioVisible.set(false); this.editandoId.set(null); this.guardando.set(false); void this.router.navigate([this.finalizados() ? '/servicios/finalizados' : '/servicios']); this.cargarDatos(); }
}
