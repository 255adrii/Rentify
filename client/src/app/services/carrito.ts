import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { Vivienda } from './viviendas';
import { Sesion } from './sesion';

interface EstadoCarrito {
  usuarioId: number;
  viviendas: Vivienda[];
}

@Injectable({ providedIn: 'root' })
export class Carrito {
  private sesion = inject(Sesion);
  private estado = signal<EstadoCarrito | null>(this.recuperar());
  viviendas = computed(() => {
    const estado = this.estado();
    return estado && estado.usuarioId === this.sesion.usuario()?.id ? estado.viviendas : [];
  });
  cantidad = computed(() => this.viviendas().length);
  totalMensual = computed(() => this.viviendas().reduce((total, v) => total + v.precio, 0));

  constructor() {
    effect(() => {
      const usuarioId = this.sesion.usuario()?.id;
      if (usuarioId) {
        sessionStorage.setItem(
          'rentify_carrito',
          JSON.stringify({ usuarioId, viviendas: this.viviendas() }),
        );
      } else {
        sessionStorage.removeItem('rentify_carrito');
        this.estado.set(null);
      }
    });
  }
  contiene(id: number) {
    return this.viviendas().some((v) => v.id === id);
  }
  agregar(vivienda: Vivienda) {
    const usuarioId = this.sesion.usuario()?.id;
    if (!usuarioId || this.contiene(vivienda.id)) return;
    this.estado.set({ usuarioId, viviendas: [...this.viviendas(), vivienda] });
  }
  eliminar(id: number) {
    const usuarioId = this.sesion.usuario()?.id;
    if (usuarioId)
      this.estado.set({ usuarioId, viviendas: this.viviendas().filter((v) => v.id !== id) });
  }
  vaciar() {
    const usuarioId = this.sesion.usuario()?.id;
    this.estado.set(usuarioId ? { usuarioId, viviendas: [] } : null);
  }
  private recuperar(): EstadoCarrito | null {
    try {
      const datos = JSON.parse(sessionStorage.getItem('rentify_carrito') || 'null');
      if (!datos || !Number.isSafeInteger(datos.usuarioId) || !Array.isArray(datos.viviendas))
        return null;
      if (
        !datos.viviendas.every(
          (v: Vivienda) =>
            Number.isSafeInteger(v.id) &&
            typeof v.titulo === 'string' &&
            Number.isFinite(v.precio) &&
            v.precio > 0,
        )
      )
        return null;
      return datos;
    } catch {
      return null;
    }
  }
}
