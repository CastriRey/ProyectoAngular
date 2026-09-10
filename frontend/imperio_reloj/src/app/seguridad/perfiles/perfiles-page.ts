import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { NavComponent } from '../../shared/nav/nav.component';
import { Perfil, Rol } from '../security.types';
import { SecurityService } from '../security.service';

@Component({
  selector: 'app-perfiles-page',
  imports: [NavComponent, ReactiveFormsModule],
  templateUrl: './perfiles-page.html',
  styleUrl: '../security-pages.css',
})
export class PerfilesPage {
  private readonly service = inject(SecurityService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected readonly perfiles = signal<Perfil[]>([]);
  protected readonly roles = signal<Rol[]>([]);
  protected readonly error = signal('');
  protected readonly formularioVisible = signal(false);
  protected readonly editandoId = signal<number | null>(null);
  protected readonly guardando = signal(false);
  protected readonly form = this.formBuilder.nonNullable.group({
    nombre_perfil: ['', Validators.required],
    codigo_rol: [0, Validators.min(1)],
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
    this.service.perfiles().subscribe({ next: (items) => this.perfiles.set(items), error: () => this.error.set('No se pudieron cargar los perfiles.') });
    this.service.roles().subscribe({ next: (items) => this.roles.set(items), error: () => this.error.set('No se pudieron cargar los roles.') });
  }

  protected nuevo(): void {
    this.editandoId.set(null);
    this.form.reset({ nombre_perfil: '', codigo_rol: 0 });
    this.formularioVisible.set(true);
    void this.router.navigate(['/seguridad/perfiles/nuevo']);
  }

  protected editar(perfilOrId: Perfil | number): void {
    const id = typeof perfilOrId === 'number' ? perfilOrId : perfilOrId.codigo_perfil;
    const perfil = typeof perfilOrId === 'number' ? this.perfiles().find((item) => item.codigo_perfil === id) : perfilOrId;
    if (!perfil) return;
    this.editandoId.set(id);
    this.form.patchValue({ nombre_perfil: perfil.nombre_perfil, codigo_rol: perfil.codigo_rol });
    this.formularioVisible.set(true);
    void this.router.navigate(['/seguridad/perfiles', id, 'editar']);
  }

  protected guardar(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.guardando.set(true);
    const request = this.editandoId() === null ? this.service.crearPerfil(this.form.getRawValue()) : this.service.actualizarPerfil(this.editandoId()!, this.form.getRawValue());
    request.subscribe({ next: () => this.cancelar(), error: () => { this.error.set('No se pudo guardar el perfil.'); this.guardando.set(false); } });
  }

  protected eliminar(perfil: Perfil): void {
    if (!confirm(`¿Eliminar el perfil "${perfil.nombre_perfil}"?`)) return;
    this.service.eliminarPerfil(perfil.codigo_perfil).subscribe({ next: () => this.cargar(), error: () => this.error.set('No se pudo eliminar el perfil.') });
  }

  protected cancelar(): void {
    this.formularioVisible.set(false);
    this.editandoId.set(null);
    this.guardando.set(false);
    void this.router.navigate(['/seguridad/perfiles']);
    this.cargar();
  }
}
