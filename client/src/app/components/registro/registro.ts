import { Component, inject, signal } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-registro',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './registro.html',
  styleUrl: './registro.scss'
})
export class Registro {

  private fb = inject(FormBuilder);
  private authService = inject(Auth);
  private router = inject(Router);

  mensajeError = signal('');
  enviando = signal(false);

  formulario = this.fb.nonNullable.group({
    nombre: ['', [Validators.required, Validators.pattern(/\S/)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [
      Validators.required,
      Validators.minLength(8)
    ]]
  });

  registrar() {
    if (this.enviando()) return;
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    this.mensajeError.set('');
    this.enviando.set(true);

    this.authService.registrar(this.formulario.getRawValue()).subscribe({
      next: (respuesta) => {
        this.enviando.set(false);

        console.log(respuesta.mensaje);

        this.router.navigate(['/login']);
      },
      error: (error) => {
        this.enviando.set(false);

        this.mensajeError.set(
          error.error?.mensaje || 'Error al registrar el usuario'
        );
      }
    });
  }
}
