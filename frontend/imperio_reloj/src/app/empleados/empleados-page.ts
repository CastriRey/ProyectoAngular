import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { NavComponent } from '../shared/nav/nav.component';
import { Empleado } from './empleado';
import { EmpleadosService } from './empleados.service';
import { SecurityService } from '../seguridad/security.service';
import { Perfil } from '../seguridad/security.types';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-empleados-page',
  imports: [NavComponent, ReactiveFormsModule],
  templateUrl: './empleados-page.html',
})
export class EmpleadosPage {
  private readonly service = inject(EmpleadosService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly securityService = inject(SecurityService);

  protected readonly empleados = signal<Empleado[]>([]);
  protected readonly perfiles = signal<Perfil[]>([]);
  protected readonly cargando = signal(true);
  protected readonly guardando = signal(false);
  protected readonly formularioVisible = signal(false);
  protected readonly editandoId = signal<number | null>(null);
  protected readonly error = signal('');
  protected readonly busqueda = signal('');
  protected readonly empleadosFiltrados = computed(() => {
    const texto = this.busqueda().trim().toLowerCase();
    if (!texto) return this.empleados();
    return this.empleados().filter((empleado) =>
      `${empleado.identificacion_empleado} ${empleado.nombre_empleado} ${empleado.primer_apellido_empleado} ${empleado.segundo_apellido_empleado}`.toLowerCase().includes(texto),
    );
  });
  protected readonly form = this.formBuilder.nonNullable.group({
    identificacion_empleado: [0, [Validators.required, Validators.min(1)]],
    nombre_empleado: ['', Validators.required],
    primer_apellido_empleado: ['', Validators.required],
    segundo_apellido_empleado: [''],
    correo_empleado: ['', [Validators.required, Validators.email]],
    telefono_empleado: [''],
    direccion_empleado: [''],
    password: [''],
    codigo_perfil_empleado: [1, [Validators.required, Validators.min(1)]],
  });

  constructor() {
    this.cargarEmpleados();
    const id = this.route.snapshot.paramMap.get('id');
    if (this.route.snapshot.url[0]?.path === 'nuevo') this.nuevo();
    if (id) this.editandoId.set(Number(id));
  }

  protected cargarEmpleados(): void {
    this.cargando.set(true);
    forkJoin({ empleados: this.service.obtenerEmpleados(), perfiles: this.securityService.perfiles() }).subscribe({
      next: ({ empleados, perfiles }) => {
        this.empleados.set(empleados);
        this.perfiles.set(perfiles);
        this.cargando.set(false);
        const id = this.editandoId();
        if (id !== null) {
          const empleado = empleados.find((item) => item.identificacion_empleado === id);
          if (empleado) this.cargarEnFormulario(empleado);
          this.formularioVisible.set(true);
        }
      },
      error: () => { this.error.set('No se pudieron cargar los empleados.'); this.cargando.set(false); },
    });
  }

  protected actualizarBusqueda(event: Event): void {
    this.busqueda.set((event.target as HTMLInputElement).value);
  }

  protected nuevo(): void {
    this.editandoId.set(null);
    this.form.reset({ identificacion_empleado: 0, nombre_empleado: '', primer_apellido_empleado: '', segundo_apellido_empleado: '', correo_empleado: '', telefono_empleado: '', direccion_empleado: '', password: '', codigo_perfil_empleado: 1 });
    this.form.controls.identificacion_empleado.enable();
    this.form.controls.password.setValidators(Validators.required);
    this.formularioVisible.set(true);
    void this.router.navigate(['/empleados/nuevo']);
  }

  protected editar(empleado: Empleado): void {
    this.editandoId.set(empleado.identificacion_empleado);
    this.cargarEnFormulario(empleado);
    this.formularioVisible.set(true);
    this.form.controls.identificacion_empleado.disable();
    this.form.controls.password.clearValidators();
    this.form.controls.password.updateValueAndValidity();
    void this.router.navigate(['/empleados', empleado.identificacion_empleado, 'editar']);
  }

  private cargarEnFormulario(empleado: Empleado): void {
    this.form.patchValue({ ...empleado, password: '' });
  }

  protected guardar(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.guardando.set(true);
    const datos = this.form.getRawValue();
    const request = this.editandoId() === null
      ? this.service.crearEmpleado(datos)
      : this.service.actualizarEmpleado(this.editandoId()!, datos);
    request.subscribe({
      next: () => this.cancelar(),
      error: (respuesta) => { this.error.set(respuesta.error?.detail ?? 'No se pudo guardar el empleado.'); this.guardando.set(false); },
    });
  }

  protected eliminar(empleado: Empleado): void {
    if (!confirm(`¿Eliminar a ${empleado.nombre_empleado} ${empleado.primer_apellido_empleado}?`)) return;
    this.service.eliminarEmpleado(empleado.identificacion_empleado).subscribe({
      next: () => this.cargarEmpleados(),
      error: () => this.error.set('No se pudo eliminar el empleado.'),
    });
  }

  protected cancelar(): void {
    this.formularioVisible.set(false);
    this.editandoId.set(null);
    this.guardando.set(false);
    this.form.controls.password.clearValidators();
    this.form.controls.password.updateValueAndValidity();
    void this.router.navigate(['/empleados']);
    this.cargarEmpleados();
  }
}
