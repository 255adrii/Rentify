import { Component, inject, signal, OnInit } from '@angular/core';
import { Viviendas, Vivienda } from '../../services/viviendas';

@Component({
  selector: 'app-viviendas-lista',
  imports: [],
  templateUrl: './viviendas-lista.html',
  styleUrl: './viviendas-lista.scss'
})
export class ViviendasLista implements OnInit {

  private viviendasService = inject(Viviendas);

  viviendas = signal<Vivienda[]>([]);
  cargando = signal(true);
  mensajeError = signal('');

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
      }
    });
  }
}
