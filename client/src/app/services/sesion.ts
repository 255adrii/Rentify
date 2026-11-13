import { Injectable, signal, computed } from '@angular/core';
import { Usuario } from './auth';

@Injectable({
  providedIn: 'root'
})
export class Sesion {

  private clave = 'rentify_usuario';

  // Usuario conectado actualmente
  private usuarioActual = signal<Usuario | null>(
    this.recuperarUsuario()
  );

  // Signals que pueden consultar los componentes
  usuario = this.usuarioActual.asReadonly();

  estaLogueado = computed(() => this.usuario() !== null);

  esAdmin = computed(() => this.usuario()?.rol === 'admin');

  iniciarSesion(usuario: Usuario) {
    this.usuarioActual.set(usuario);

    sessionStorage.setItem(
      this.clave,
      JSON.stringify(usuario)
    );
  }

  cerrarSesion() {
    this.usuarioActual.set(null);
    sessionStorage.removeItem(this.clave);
  }

  private recuperarUsuario(): Usuario | null {
    const datos = sessionStorage.getItem(this.clave);

    if (!datos) {
      return null;
    }

    try {
      return JSON.parse(datos) as Usuario;
    } catch {
      return null;
    }
  }
}
