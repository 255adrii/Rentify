import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize, takeUntil } from 'rxjs';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Auth } from '../../services/auth';
import { Sesion } from '../../services/sesion';

@Component({ selector: 'app-perfil', imports: [ReactiveFormsModule], templateUrl: './perfil.html' })
export class Perfil {
  sesion = inject(Sesion);
  private auth = inject(Auth);
  private fb = inject(FormBuilder);
  private destroyRef = inject(DestroyRef);
  guardando = signal(false);
  error = signal('');
  mensaje = signal('');
  formulario = this.fb.nonNullable.group({
    nombre: [this.sesion.usuario()?.nombre ?? '', [Validators.required, Validators.pattern(/\S/)]],
    email: [this.sesion.usuario()?.email ?? '', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });
  guardar() {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }
    if (this.guardando()) return;
    if (!this.sesion.usuario()) return;
    this.error.set('');
    this.mensaje.set('');
    this.guardando.set(true);
    this.auth.actualizarPerfil(this.formulario.getRawValue()).pipe(
      takeUntil(this.sesion.cambios$), takeUntilDestroyed(this.destroyRef),
      finalize(() => this.guardando.set(false))
    ).subscribe({
      next: (respuesta) => {
        this.sesion.actualizarUsuario(respuesta.usuario);
        this.formulario.patchValue({
          nombre: respuesta.usuario.nombre,
          email: respuesta.usuario.email,
          password: '',
        });
        this.formulario.markAsUntouched();
        this.mensaje.set('Perfil actualizado correctamente');
        this.guardando.set(false);
      },
      error: (error) => {
        this.error.set(error.error?.mensaje || 'No se pudo actualizar el perfil');
        this.guardando.set(false);
      },
    });
  }
}
