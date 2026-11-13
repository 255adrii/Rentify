import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { Sesion } from '../../services/sesion';
import { Viviendas } from '../../services/viviendas';
import { Reservas, Reserva } from '../../services/reservas';
import { Carrito } from '../../services/carrito';
import { Administracion } from '../administracion/administracion';

@Component({
  imports: [RouterLink, Administracion],
  selector: 'app-dashboard',
  styleUrl: './dashboard.scss',
  templateUrl: './dashboard.html',
})
export class Dashboard implements OnInit {
  sesion = inject(Sesion);
  carrito = inject(Carrito);
  private viviendasService = inject(Viviendas);
  private reservasService = inject(Reservas);
  viviendas = signal(0);
  reservas = signal<Reserva[]>([]);
  cargando = signal(true);
  error = signal('');
  propias = computed(() =>
    this.reservas().filter(
      (r) => this.sesion.esAdmin() || r.usuarioId === this.sesion.usuario()?.id,
    ),
  );
  pendientes = computed(() => this.propias().filter((r) => r.estado === 'pendiente').length);
  ngOnInit() {
    if (!this.sesion.esAdmin()) this.cargar();
  }
  cargar() {
    this.cargando.set(true);
    this.error.set('');
    forkJoin({
      viviendas: this.viviendasService.obtenerTodas(),
      reservas: this.reservasService.obtenerTodas(),
    }).subscribe({
      next: (datos) => {
        this.viviendas.set(datos.viviendas.length);
        this.reservas.set(datos.reservas);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No se pudo cargar el resumen');
        this.cargando.set(false);
      },
    });
  }
}
