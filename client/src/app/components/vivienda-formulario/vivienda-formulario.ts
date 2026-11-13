import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { catchError, of, switchMap } from 'rxjs';
import { Viviendas } from '../../services/viviendas';

@Component({ selector: 'app-vivienda-formulario', imports: [ReactiveFormsModule, RouterLink], templateUrl: './vivienda-formulario.html', styleUrl: './vivienda-formulario.scss' })
export class ViviendaFormulario implements OnInit {
  private fb = inject(FormBuilder);
  private servicio = inject(Viviendas);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);
  id = signal<number | null>(null);
  cargando = signal(false);
  guardando = signal(false);
  mensajeError = signal('');
  errorCarga = signal(false);
  modoEdicion = computed(() => this.id() !== null);
  formulario = this.fb.nonNullable.group({
    titulo: ['', [Validators.required, Validators.pattern(/\S/)]],
    precio: [0, [Validators.required, Validators.min(0.01)]]
  });

  ngOnInit() {
    this.route.paramMap.pipe(switchMap(params => {
      const texto = params.get('id');
      const id = texto === null ? null : Number(texto);
      this.id.set(id); this.mensajeError.set(''); this.errorCarga.set(false);
      this.formulario.reset(); this.cargando.set(true);
      if (id === null) return of(null);
      if (!Number.isSafeInteger(id) || id <= 0) {
        this.errorCarga.set(true); this.mensajeError.set('ID de vivienda no válido');
        return of(null);
      }
      return this.servicio.obtenerPorId(id).pipe(catchError(error => {
        this.errorCarga.set(true); this.mensajeError.set(error.error?.mensaje || 'No se pudo cargar la vivienda');
        return of(null);
      }));
    }), takeUntilDestroyed(this.destroyRef)).subscribe(vivienda => {
      if (vivienda) this.formulario.patchValue(vivienda);
      this.cargando.set(false);
    });
  }

  guardar() {
    if (this.formulario.invalid) { this.formulario.markAllAsTouched(); return; }
    if (this.guardando() || this.cargando() || this.errorCarga()) return;
    this.guardando.set(true); this.mensajeError.set('');
    const datos = this.formulario.getRawValue(); datos.titulo = datos.titulo.trim();
    const id = this.id();
    const peticion = id === null ? this.servicio.crear(datos) : this.servicio.actualizar(id, datos);
    peticion.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => { this.guardando.set(false); void this.router.navigate(['/viviendas']); },
      error: error => { this.guardando.set(false); this.mensajeError.set(error.error?.mensaje || 'Error al guardar la vivienda'); }
    });
  }
}
