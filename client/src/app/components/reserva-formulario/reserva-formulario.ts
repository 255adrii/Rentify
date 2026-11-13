import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { catchError, forkJoin, of, switchMap } from 'rxjs';
import { Reservas, EstadoReserva } from '../../services/reservas';
import { Viviendas, Vivienda } from '../../services/viviendas';
import { Sesion } from '../../services/sesion';
import { fechasOrdenadas } from '../../validators/fechas';

@Component({
  selector: 'app-reserva-formulario',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './reserva-formulario.html',
})
export class ReservaFormulario implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private servicio = inject(Reservas);
  private viviendasService = inject(Viviendas);
  private destroyRef = inject(DestroyRef);
  estadoOriginal = signal<EstadoReserva>('pendiente');
  sesion = inject(Sesion);
  id = signal<number | null>(null);
  viviendas = signal<Vivienda[]>([]);
  cargando = signal(true);
  guardando = signal(false);
  error = signal('');
  errorCarga = signal(false);
  formulario = this.fb.nonNullable.group(
    {
      viviendaId: [0, [Validators.required, Validators.min(1)]],
      usuarioId: [
        this.sesion.usuario()?.id ?? 0,
        [Validators.required, Validators.min(1), Validators.pattern(/^\d+$/)],
      ],
      fechaInicio: ['', Validators.required],
      fechaFin: ['', Validators.required],
      estado: ['pendiente' as EstadoReserva, Validators.required],
    },
    { validators: fechasOrdenadas },
  );

  ngOnInit() {
    this.route.paramMap.pipe(switchMap(params => {
    const texto = params.get('id');
    this.error.set(''); this.errorCarga.set(false); this.cargando.set(true);
    this.formulario.reset(); this.estadoOriginal.set('pendiente');
    const id = texto === null ? null : Number(texto);
    if (id !== null && (!Number.isSafeInteger(id) || id <= 0)) {
      this.error.set('ID de reserva no válido');
      this.errorCarga.set(true);
      this.cargando.set(false);
      return of(null);
    }
    this.id.set(id);
    return forkJoin({
      viviendas: this.viviendasService.obtenerTodas(),
      reserva: id === null ? of(null) : this.servicio.obtenerPorId(id),
    }).pipe(catchError(error => {
      this.error.set(error.error?.mensaje || 'No se pudieron cargar los datos');
      this.errorCarga.set(true);
      return of(null);
    }));
    }), takeUntilDestroyed(this.destroyRef)).subscribe(datos => {
      this.cargando.set(false);
      if (datos) {
        const { viviendas, reserva } = datos;
        this.viviendas.set(viviendas);
        if (reserva && !this.sesion.esAdmin() && reserva.usuarioId !== this.sesion.usuario()?.id) {
          this.error.set('Esta reserva pertenece a otro usuario');
          this.errorCarga.set(true);
        } else if (reserva) {
          this.estadoOriginal.set(reserva.estado);
          this.formulario.patchValue(reserva);
        }
        this.cargando.set(false);
      }
    });
  }
  guardar() {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }
    if (this.guardando() || this.cargando() || this.errorCarga()) return;
    const datos = this.formulario.getRawValue();
    if (!this.sesion.esAdmin()) datos.usuarioId = this.sesion.usuario()!.id;
    this.guardando.set(true);
    this.error.set('');
    const id = this.id();
    const peticion = id === null ? this.servicio.crear(datos) : this.servicio.actualizar(id, datos);
    peticion.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.guardando.set(false);
        this.router.navigate(['/reservas']);
      },
      error: (error) => {
        this.error.set(error.error?.mensaje || 'No se pudo guardar la reserva');
        this.guardando.set(false);
      },
    });
  }
}
