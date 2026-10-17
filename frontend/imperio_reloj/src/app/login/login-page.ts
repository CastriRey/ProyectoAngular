import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../auth/auth.service';
import { PermissionService } from '../auth/permission.service';

@Component({
  selector: 'app-login-page',
  imports: [ReactiveFormsModule],
  styleUrl: './login-page.css',
  templateUrl: './login-page.html',
})
export class LoginPage {
  private readonly formBuilder = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly permissionService = inject(PermissionService);

  protected readonly enviando = signal(false);
  protected readonly error = signal('');

  // Reactive Forms mantiene los valores y validaciones del formulario en TypeScript.
  protected readonly loginForm = this.formBuilder.nonNullable.group({
    correo: ['', [Validators.required, Validators.email]],
    contrasena: ['', Validators.required],
  });

  protected iniciarSesion(): void {
    this.error.set('');

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.enviando.set(true);
    this.authService.iniciarSesion(this.loginForm.getRawValue()).subscribe({
      next: () => {
        this.permissionService.tieneAlgunaRutaConsultable().subscribe({
          next: (tieneAcceso) => void this.router.navigate([tieneAcceso ? '/dashboard' : '/sin-permisos']),
          error: () => void this.router.navigate(['/sin-permisos']),
        });
      },
      error: (respuesta) => {
        this.error.set(respuesta.error?.error ?? 'No se pudo iniciar sesión.');
        this.enviando.set(false);
      },
    });
  }
}
