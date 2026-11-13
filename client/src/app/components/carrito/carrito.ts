import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CurrencyPipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { catchError, concatMap, finalize, from, map, of, takeUntil, toArray } from 'rxjs';
import { Carrito as CarritoService } from '../../services/carrito';
import { Reservas } from '../../services/reservas';
import { Sesion } from '../../services/sesion';
import { fechasOrdenadas } from '../../validators/fechas';

@Component({
  selector: 'app-carrito',
  imports: [RouterLink, ReactiveFormsModule, CurrencyPipe],
  templateUrl: './carrito.html',
})
export class Carrito {
  carrito = inject(CarritoService);
  private reservas = inject(Reservas);
  private sesion = inject(Sesion);
  private fb = inject(FormBuilder);
  private destroyRef = inject(DestroyRef);
  enviando = signal(false);
  mensaje = signal('');
  errores = signal<string[]>([]);
  formulario = this.fb.nonNullable.group(
    {
      fechaInicio: ['', Validators.required],
      fechaFin: ['', Validators.required],
    },
    { validators: fechasOrdenadas },
  );

  confirmar() {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }
    const usuarioId = this.sesion.usuario()?.id;
    if (!usuarioId || this.enviando() || !this.carrito.cantidad()) return;
    this.enviando.set(true);
    this.mensaje.set('');
    this.errores.set([]);
    const fechas = this.formulario.getRawValue();
    // Se conservan los fallos y se retiran solo las reservas ya creadas.
    from([...this.carrito.viviendas()])
      .pipe(
        concatMap((v) =>
          this.reservas.crear({ ...fechas, usuarioId, viviendaId: v.id }).pipe(
            map(() => {
              this.carrito.eliminar(v.id);
              return true;
            }),
            catchError((error) => {
              this.errores.update((datos) => [
                ...datos,
                `${v.titulo}: ${error.error?.mensaje || 'No se pudo reservar'}`,
              ]);
              return of(false);
            }),
          ),
        ),
        toArray(),
        takeUntil(this.sesion.cambios$),
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.enviando.set(false)),
      )
      .subscribe((resultados) => {
        const creadas = resultados.filter(Boolean).length;
        this.mensaje.set(`Reservas creadas: ${creadas}. Puedes consultarlas en Mis reservas.`);
      });
  }
}
