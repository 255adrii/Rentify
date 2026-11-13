import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Viviendas, Vivienda } from '../../services/viviendas';
import { Filtro } from '../filtro/filtro';
import { Carrito } from '../../services/carrito';
import { Sesion } from '../../services/sesion';

@Component({
  selector: 'app-viviendas-lista',
  imports: [RouterLink, Filtro],
  templateUrl: './viviendas-lista.html',
  styleUrl: './viviendas-lista.scss',
})
export class ViviendasLista implements OnInit {
  private viviendasService = inject(Viviendas);
  carrito = inject(Carrito);
  sesion = inject(Sesion);

  viviendas = signal<Vivienda[]>([]);
  cargando = signal(true);
  mensajeError = signal('');
  errorAccion = signal('');
  eliminando = signal<number | null>(null);

  busqueda = signal('');

  orden = signal('titulo-asc');

  viviendasVisibles = computed(() => {
    const texto = this.busqueda().trim().toLowerCase();

    const filtradas = this.viviendas().filter((vivienda) =>
      vivienda.titulo.toLowerCase().includes(texto),
    );

    return [...filtradas].sort((a, b) => {
      switch (this.orden()) {
        case 'precio-asc':
          return a.precio - b.precio;

        case 'precio-desc':
          return b.precio - a.precio;

        case 'titulo-desc':
          return b.titulo.localeCompare(a.titulo, 'es');

        default:
          return a.titulo.localeCompare(b.titulo, 'es');
      }
    });
  });

  ngOnInit() {
    this.cargarViviendas();
  }

  cargarViviendas() {
    this.cargando.set(true);
    this.mensajeError.set('');

    this.viviendasService.obtenerTodas().subscribe({
      next: (datos) => {
        this.viviendas.set(datos);
        this.cargando.set(false);
      },
      error: () => {
        this.mensajeError.set('Error al cargar las viviendas');
        this.cargando.set(false);
      },
    });
  }

  cambiarOrden(event: Event) {
    const select = event.target as HTMLSelectElement;
    this.orden.set(select.value);
  }

  eliminar(vivienda: Vivienda) {
    if (this.eliminando() !== null || !confirm(`¿Eliminar «${vivienda.titulo}»?`)) return;
    this.eliminando.set(vivienda.id);
    this.errorAccion.set('');
    this.viviendasService.eliminar(vivienda.id).subscribe({
      next: () => {
        this.carrito.eliminar(vivienda.id);
        this.viviendas.update((datos) => datos.filter((v) => v.id !== vivienda.id));
        this.eliminando.set(null);
      },
      error: (error) => {
        this.errorAccion.set(error.error?.mensaje || 'No se pudo eliminar la vivienda');
        this.eliminando.set(null);
      },
    });
  }
}
