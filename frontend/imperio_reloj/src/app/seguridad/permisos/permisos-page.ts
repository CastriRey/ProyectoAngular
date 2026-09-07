import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { NavComponent } from '../../shared/nav/nav.component';
import { Permiso, Perfil, Ruta } from '../security.types';
import { SecurityService } from '../security.service';

@Component({
  selector: 'app-permisos-page',
  imports: [NavComponent, ReactiveFormsModule],
  templateUrl: './permisos-page.html',
})
export class PermisosPage {
  private readonly service = inject(SecurityService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected readonly permisos = signal<Permiso[]>([]);
  protected readonly perfiles = signal<Perfil[]>([]);
  protected readonly rutas = signal<Ruta[]>([]);
  protected readonly error = signal('');
  protected readonly formularioVisible = signal(false);
  protected readonly editandoId = signal<number | null>(null);
  protected readonly guardando = signal(false);
  protected readonly form = this.formBuilder.nonNullable.group({
    codigo_perfil_permiso: [0, Validators.min(1)],
    codigo_ruta_permiso: [0, Validators.min(1)],
    consultar: ['S' as 'S' | 'N', Validators.required],
    insertar: ['N' as 'S' | 'N', Validators.required],
    modificar: ['N' as 'S' | 'N', Validators.required],
    eliminar: ['N' as 'S' | 'N', Validators.required],
  });

  constructor() {
    this.cargar();
    const id = this.route.snapshot.paramMap.get('id');
    if (this.route.snapshot.url[0]?.path === 'nuevo' || id) {
      this.formularioVisible.set(true);
      if (id) this.editar(Number(id));
    }
  }

  protected cargar(): void {
    this.service.permisos().subscribe({ next: (items) => this.permisos.set(items), error: () => this.error.set('No se pudieron cargar los permisos.') });
    this.service.perfiles().subscribe({ next: (items) => this.perfiles.set(items), error: () => this.error.set('No se pudieron cargar los perfiles.') });
    this.service.rutas().subscribe({ next: (items) => this.rutas.set(items), error: () => this.error.set('No se pudieron cargar las rutas.') });
  }

  protected nuevo(): void {
    this.editandoId.set(null);
    this.form.reset({ codigo_perfil_permiso: 0, codigo_ruta_permiso: 0, consultar: 'S', insertar: 'N', modificar: 'N', eliminar: 'N' });
    this.formularioVisible.set(true);
    void this.router.navigate(['/seguridad/permisos/nuevo']);
  }

  protected editar(permisoOrId: Permiso | number): void {
    const id = typeof permisoOrId === 'number' ? permisoOrId : permisoOrId.id;
    const permiso = typeof permisoOrId === 'number' ? this.permisos().find((item) => item.id === id) : permisoOrId;
    if (id === undefined || !permiso) return;
    this.editandoId.set(id);
    this.form.patchValue(permiso);
    this.formularioVisible.set(true);
    void this.router.navigate(['/seguridad/permisos', id, 'editar']);
  }

  protected guardar(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.guardando.set(true);
    const request = this.editandoId() === null ? this.service.crearPermiso(this.form.getRawValue()) : this.service.actualizarPermiso(this.editandoId()!, this.form.getRawValue());
    request.subscribe({ next: () => this.cancelar(), error: () => { this.error.set('No se pudo guardar el permiso.'); this.guardando.set(false); } });
  }

  protected eliminar(permiso: Permiso): void {
    if (permiso.id === undefined || !confirm('¿Eliminar este permiso?')) return;
    this.service.eliminarPermiso(permiso.id).subscribe({ next: () => this.cargar(), error: () => this.error.set('No se pudo eliminar el permiso.') });
  }

  protected cancelar(): void {
    this.formularioVisible.set(false);
    this.editandoId.set(null);
    this.guardando.set(false);
    void this.router.navigate(['/seguridad/permisos']);
    this.cargar();
  }
}
