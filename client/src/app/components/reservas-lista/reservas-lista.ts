import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { Reservas, Reserva } from '../../services/reservas';
import { Viviendas, Vivienda } from '../../services/viviendas';
import { Sesion } from '../../services/sesion';
import { Filtro } from '../filtro/filtro';

@Component({
  selector: 'app-reservas-lista',
  imports: [RouterLink, Filtro, DatePipe],
  templateUrl: './reservas-lista.html',
})
export class ReservasLista implements OnInit {
  private servicio = inject(Reservas);
  private viviendasService = inject(Viviendas);
  sesion = inject(Sesion);
  reservas = signal<Reserva[]>([]);
  viviendas = signal<Vivienda[]>([]);
  cargando = signal(true);
  error = signal('');
  errorAccion = signal('');
  eliminando = signal<number | null>(null);
  busqueda = signal('');
  estado = signal('');
  orden = signal('inicio-asc');
  visibles = computed(() => {
    const texto = this.busqueda().trim().toLowerCase();
    return this.reservas()
      .filter(
        (r) =>
          (this.sesion.esAdmin() || r.usuarioId === this.sesion.usuario()?.id) &&
          (!this.estado() || r.estado === this.estado()) &&
          `${r.id} ${r.usuarioId} ${this.titulo(r.viviendaId)} ${r.estado}`
            .toLowerCase()
            .includes(texto),
      )
      .sort((a, b) => {
        switch (this.orden()) {
          case 'inicio-desc':
            return b.fechaInicio.localeCompare(a.fechaInicio) || b.id - a.id;
          case 'vivienda':
            return this.titulo(a.viviendaId).localeCompare(this.titulo(b.viviendaId), 'es');
          case 'estado':
            return a.estado.localeCompare(b.estado, 'es');
          default:
            return a.fechaInicio.localeCompare(b.fechaInicio) || a.id - b.id;
        }
      });
  });

  ngOnInit() {
    this.cargar();
  }
  cargar() {
    this.cargando.set(true);
    this.error.set('');
    forkJoin({
      reservas: this.servicio.obtenerTodas(),
      viviendas: this.viviendasService.obtenerTodas(),
    }).subscribe({
      next: (datos) => {
        this.reservas.set(datos.reservas);
        this.viviendas.set(datos.viviendas);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No se pudieron cargar las reservas');
        this.cargando.set(false);
      },
    });
  }
  titulo(id: number) {
    return this.viviendas().find((v) => v.id === id)?.titulo ?? `Vivienda #${id}`;
  }
  valor(event: Event) {
    return (event.target as HTMLSelectElement).value;
  }
  eliminar(reserva: Reserva) {
    if (this.eliminando() !== null || !confirm(`¿Eliminar la reserva #${reserva.id}?`)) return;
    this.eliminando.set(reserva.id);
    this.errorAccion.set('');
    this.servicio.eliminar(reserva.id).subscribe({
      next: () => {
        this.reservas.update((datos) => datos.filter((r) => r.id !== reserva.id));
        this.eliminando.set(null);
      },
      error: (error) => {
        this.errorAccion.set(error.error?.mensaje || 'No se pudo eliminar la reserva');
        this.eliminando.set(null);
      },
    });
  }
}
