import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../auth/auth.service';

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
        // Después de guardar los tokens, Angular navega al dashboard protegido.
        void this.router.navigate(['/dashboard']);
      },
      error: (respuesta) => {
        this.error.set(respuesta.error?.error ?? 'No se pudo iniciar sesión.');
        this.enviando.set(false);
      },
    });
  }
}
