import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { finalize, forkJoin } from 'rxjs';
import { Viviendas } from '../../services/viviendas';
import { EstadoReserva, Reserva, Reservas } from '../../services/reservas';

@Component({
  selector: 'app-administracion',
  imports: [RouterLink],
  templateUrl: './administracion.html',
  styleUrl: './administracion.scss',
})
export class Administracion implements OnInit {
  private viviendasService = inject(Viviendas);
  private reservasService = inject(Reservas);
  private destroyRef = inject(DestroyRef);

  viviendas = signal(0);
  reservas = signal<Reserva[]>([]);
  cargando = signal(false);
  error = signal('');
  totalReservas = computed(() => this.reservas().length);
  pendientes = computed(() => this.reservas().filter((r) => r.estado === 'pendiente').length);
  sinDatos = computed(() => this.viviendas() === 0 && this.totalReservas() === 0);
  anioSeleccionado = signal<number | null>(null);
  aniosDisponibles = computed(() =>
    [...new Set(this.reservas().map((r) => Number(r.fechaInicio.slice(0, 4))))].sort(
      (a, b) => b - a,
    ),
  );
  anioGrafico = computed(() => {
    const seleccionado = this.anioSeleccionado();
    const disponibles = this.aniosDisponibles();
    return seleccionado !== null && disponibles.includes(seleccionado)
      ? seleccionado
      : disponibles[0];
  });

  reservasPorMes = computed(() => {
    const anio = this.anioGrafico();
    if (anio === undefined) return [];
    const meses = new Map<string, number>();
    for (const reserva of this.reservas()) {
      // YYYY-MM mantiene separados los años y permite ordenar cronológicamente.
      const mes = reserva.fechaInicio.slice(0, 7);
      meses.set(mes, (meses.get(mes) ?? 0) + 1);
    }
    const formato = new Intl.DateTimeFormat('es-ES', {
      month: 'long',
      year: 'numeric',
      timeZone: 'UTC',
    });
    // Los doce meses del año elegido: ausencia de reservas significa cero.
    return Array.from({ length: 12 }, (_, indice) => {
      const mes = `${String(anio).padStart(4, '0')}-${String(indice + 1).padStart(2, '0')}`;
      return {
        mes,
        cantidad: meses.get(mes) ?? 0,
        etiqueta: formato.format(new Date(`${mes}-01T00:00:00Z`)),
        abreviatura: new Intl.DateTimeFormat('es-ES', { month: 'short', timeZone: 'UTC' }).format(
          new Date(`${mes}-01T00:00:00Z`),
        ),
      };
    });
  });
  pasoEje = computed(() =>
    Math.max(1, Math.ceil(Math.max(0, ...this.reservasPorMes().map((m) => m.cantidad)) / 4)),
  );
  maximoMensual = computed(
    () =>
      Math.max(
        1,
        Math.ceil(Math.max(0, ...this.reservasPorMes().map((m) => m.cantidad)) / this.pasoEje()),
      ) * this.pasoEje(),
  );
  marcasEje = computed(() =>
    Array.from(
      { length: this.maximoMensual() / this.pasoEje() + 1 },
      (_, i) => i * this.pasoEje(),
    ).reverse(),
  );

  distribucionEstados = computed(() => {
    const estados: { estado: EstadoReserva; etiqueta: string }[] = [
      { estado: 'pendiente', etiqueta: 'Pendientes' },
      { estado: 'confirmada', etiqueta: 'Confirmadas' },
      { estado: 'cancelada', etiqueta: 'Canceladas' },
    ];
    let acumulado = 0;
    return estados.map(({ estado, etiqueta }) => {
      const cantidad = this.reservas().filter((r) => r.estado === estado).length;
      const porcentaje = this.totalReservas() ? (cantidad / this.totalReservas()) * 100 : 0;
      const porcentajeTexto = new Intl.NumberFormat('es-ES', { maximumFractionDigits: 1 }).format(
        porcentaje,
      );
      const segmento = {
        estado,
        etiqueta,
        cantidad,
        porcentaje,
        porcentajeTexto,
        desplazamiento: -acumulado,
      };
      acumulado += porcentaje;
      return segmento;
    });
  });

  cambiarAnio(event: Event) {
    this.anioSeleccionado.set(Number((event.target as HTMLSelectElement).value));
  }

  ngOnInit() {
    this.cargar();
  }

  cargar() {
    if (this.cargando()) return;
    this.cargando.set(true);
    this.error.set('');
    forkJoin({
      viviendas: this.viviendasService.obtenerTodas(),
      reservas: this.reservasService.obtenerTodas(),
    })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.cargando.set(false)),
      )
      .subscribe({
        next: (datos) => {
          this.viviendas.set(datos.viviendas.length);
          this.reservas.set(datos.reservas);
        },
        error: () =>
          this.error.set(
            'No se pudo cargar el resumen. Comprueba la conexión e inténtalo de nuevo.',
          ),
      });
  }
}
