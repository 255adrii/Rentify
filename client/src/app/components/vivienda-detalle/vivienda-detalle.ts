import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { catchError, of, switchMap } from 'rxjs';
import { Viviendas, Vivienda } from '../../services/viviendas';
import { Carrito } from '../../services/carrito';

@Component({ selector: 'app-vivienda-detalle', imports: [RouterLink], templateUrl: './vivienda-detalle.html', styleUrl: './vivienda-detalle.scss' })
export class ViviendaDetalle implements OnInit {
  carrito = inject(Carrito);
  private route = inject(ActivatedRoute);
  private servicio = inject(Viviendas);
  private destroyRef = inject(DestroyRef);
  vivienda = signal<Vivienda | null>(null);
  cargando = signal(true);
  mensajeError = signal('');

  ngOnInit() {
    this.route.paramMap.pipe(
      switchMap(params => {
        const id = Number(params.get('id'));
        this.vivienda.set(null); this.mensajeError.set(''); this.cargando.set(true);
        if (!Number.isSafeInteger(id) || id <= 0) {
          this.mensajeError.set('ID de vivienda no válido');
          return of(null);
        }
        return this.servicio.obtenerPorId(id).pipe(catchError(error => {
          this.mensajeError.set(error.error?.mensaje || 'No se pudo cargar la vivienda');
          return of(null);
        }));
      }), takeUntilDestroyed(this.destroyRef)
    ).subscribe(vivienda => { this.vivienda.set(vivienda); this.cargando.set(false); });
  }
}
