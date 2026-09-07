import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { NavComponent } from '../../shared/nav/nav.component';
import { Rol } from '../security.types';
import { SecurityService } from '../security.service';

@Component({
  selector: 'app-roles-page',
  imports: [NavComponent, ReactiveFormsModule],
  templateUrl: './roles-page.html',
})
export class RolesPage {
  private readonly service = inject(SecurityService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected readonly roles = signal<Rol[]>([]);
  protected readonly error = signal('');
  protected readonly guardando = signal(false);
  protected readonly formularioVisible = signal(false);
  protected readonly editandoId = signal<number | null>(null);
  protected readonly form = this.formBuilder.nonNullable.group({ nombre_rol: ['', Validators.required] });

  constructor() {
    this.cargarRoles();
    const id = this.route.snapshot.paramMap.get('id');
    if (this.route.snapshot.url[0]?.path === 'nuevo' || id) {
      this.formularioVisible.set(true);
      if (id) this.editar(Number(id));
    }
  }

  protected cargarRoles(): void {
    this.service.roles().subscribe({
      next: (roles) => this.roles.set(roles),
      error: () => this.error.set('No se pudieron cargar los roles.'),
    });
  }

  protected nuevo(): void {
    this.editandoId.set(null);
    this.form.reset({ nombre_rol: '' });
    this.formularioVisible.set(true);
    void this.router.navigate(['/seguridad/roles/nuevo']);
  }

  protected editar(rolOrId: Rol | number): void {
    const id = typeof rolOrId === 'number' ? rolOrId : rolOrId.codigo_rol;
    const rol = typeof rolOrId === 'number' ? this.roles().find((item) => item.codigo_rol === id) : rolOrId;
    if (!rol) return;
    this.editandoId.set(id);
    this.form.patchValue({ nombre_rol: rol.nombre_rol });
    this.formularioVisible.set(true);
    void this.router.navigate(['/seguridad/roles', id, 'editar']);
  }

  protected guardar(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.guardando.set(true);
    const request = this.editandoId() === null
      ? this.service.crearRol(this.form.getRawValue())
      : this.service.actualizarRol(this.editandoId()!, this.form.getRawValue());
    request.subscribe({
      next: () => this.cancelar(),
      error: () => { this.error.set('No se pudo guardar el rol.'); this.guardando.set(false); },
    });
  }

  protected eliminar(rol: Rol): void {
    if (!confirm(`¿Eliminar el rol "${rol.nombre_rol}"?`)) return;
    this.service.eliminarRol(rol.codigo_rol).subscribe({
      next: () => this.cargarRoles(),
      error: () => this.error.set('No se pudo eliminar el rol.'),
    });
  }

  protected cancelar(): void {
    this.formularioVisible.set(false);
    this.editandoId.set(null);
    this.guardando.set(false);
    this.form.reset({ nombre_rol: '' });
    void this.router.navigate(['/seguridad/roles']);
    this.cargarRoles();
  }
}
