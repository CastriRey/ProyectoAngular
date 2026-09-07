import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { Cliente } from './cliente';
import { ClientesService } from './clientes.service';
import { NavComponent } from '../shared/nav/nav.component';

@Component({
  selector: 'app-clientes-page',
  imports: [NavComponent, ReactiveFormsModule],
  templateUrl: './clientes-page.html',
})
export class ClientesPage {
  private readonly clientesService = inject(ClientesService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected readonly clientes = signal<Cliente[]>([]);
  protected readonly cargando = signal(true);
  protected readonly error = signal('');
  protected readonly guardando = signal(false);
  protected readonly formularioVisible = signal(false);
  protected readonly editandoId = signal<number | null>(null);
  protected readonly form = this.formBuilder.nonNullable.group({
    identificacion_cliente: [0, [Validators.required, Validators.min(1)]],
    nombre_cliente: ['', Validators.required],
    primer_apellido_cliente: ['', Validators.required],
    segundo_apellido_cliente: [''],
    correo_cliente: ['', Validators.email],
    telefono_cliente: [''],
    identificacion_empleado: [0, [Validators.required, Validators.min(1)]],
    comentarios: [''],
  });

  constructor() {
    this.cargarClientes();
    const id = this.route.snapshot.paramMap.get('id');
    if (this.route.snapshot.url[0]?.path === 'nuevo') this.nuevo();
    if (id) this.editandoId.set(Number(id));
  }

  protected cargarClientes(): void {
    this.cargando.set(true);
    this.error.set('');

    this.clientesService.obtenerClientes().subscribe({
      next: (clientes) => {
        this.clientes.set(clientes);
        this.cargando.set(false);
        const id = this.editandoId();
        if (id !== null) {
          const cliente = clientes.find((item) => item.identificacion_cliente === id);
          if (cliente) this.form.patchValue({ ...cliente, segundo_apellido_cliente: cliente.segundo_apellido_cliente ?? '', correo_cliente: cliente.correo_cliente ?? '', telefono_cliente: cliente.telefono_cliente ?? '', comentarios: cliente.comentarios ?? '' });
          this.formularioVisible.set(true);
        }
      },
      error: () => {
        this.error.set('No se pudo conectar con la API de clientes.');
        this.cargando.set(false);
      },
    });
  }

  protected nuevo(): void {
    this.editandoId.set(null);
    this.form.reset({ identificacion_cliente: 0, nombre_cliente: '', primer_apellido_cliente: '', segundo_apellido_cliente: '', correo_cliente: '', telefono_cliente: '', identificacion_empleado: 0, comentarios: '' });
    this.form.controls.identificacion_cliente.enable();
    this.formularioVisible.set(true);
    void this.router.navigate(['/clientes/nuevo']);
  }

  protected editar(cliente: Cliente): void {
    this.editandoId.set(cliente.identificacion_cliente);
    this.form.patchValue({ ...cliente, segundo_apellido_cliente: cliente.segundo_apellido_cliente ?? '', correo_cliente: cliente.correo_cliente ?? '', telefono_cliente: cliente.telefono_cliente ?? '', comentarios: cliente.comentarios ?? '' });
    this.form.controls.identificacion_cliente.disable();
    this.formularioVisible.set(true);
    void this.router.navigate(['/clientes', cliente.identificacion_cliente, 'editar']);
  }

  protected guardar(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.guardando.set(true);
    const datos = this.form.getRawValue();
    const request = this.editandoId() === null ? this.clientesService.crearCliente(datos) : this.clientesService.actualizarCliente(this.editandoId()!, datos);
    request.subscribe({ next: () => this.cancelar(), error: (respuesta) => { this.error.set(respuesta.error?.detail ?? 'No se pudo guardar el cliente.'); this.guardando.set(false); } });
  }

  protected eliminar(cliente: Cliente): void {
    if (!confirm(`¿Eliminar a ${cliente.nombre_cliente} ${cliente.primer_apellido_cliente}?`)) return;
    this.clientesService.eliminarCliente(cliente.identificacion_cliente).subscribe({ next: () => this.cargarClientes(), error: () => this.error.set('No se pudo eliminar el cliente.') });
  }

  protected cancelar(): void {
    this.formularioVisible.set(false);
    this.editandoId.set(null);
    this.guardando.set(false);
    void this.router.navigate(['/clientes']);
    this.cargarClientes();
  }
}
