import { Component, inject, signal } from '@angular/core';
import { Sesion } from '../../services/sesion';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login {

  private fb = inject(FormBuilder);
  private authService = inject(Auth);
  private router = inject(Router);
  private sesionService = inject(Sesion);

  mensajeError = signal('');
  enviando = signal(false);

  formulario = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });

  iniciarSesion() {
    if (this.enviando()) return;
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    this.mensajeError.set('');
    this.enviando.set(true);

    this.authService.login(this.formulario.getRawValue()).subscribe({
      
    next: (respuesta) => {
      this.enviando.set(false);

      this.sesionService.iniciarSesion(respuesta.usuario, respuesta.token);

      this.router.navigate(['/dashboard']);
    },

      error: (error) => {
        this.enviando.set(false);

        this.mensajeError.set(
          error.error?.mensaje || 'Error al iniciar sesión'
        );
      }
    });
  }
}
