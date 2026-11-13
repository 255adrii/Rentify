import { Injectable, signal, computed } from '@angular/core';
import { Usuario } from './auth';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Sesion {
  private clave = 'rentify_usuario';
  private tokenActual = signal<string | null>(this.recuperarToken());
  private verificada = false;
  private cambios = new Subject<void>();
  cambios$ = this.cambios.asObservable();
  token = this.tokenActual.asReadonly();

  // Usuario conectado actualmente
  private usuarioActual = signal<Usuario | null>(this.recuperarUsuario());

  // Signals que pueden consultar los componentes
  usuario = this.usuarioActual.asReadonly();

  estaLogueado = computed(() => this.usuario() !== null && this.token() !== null);

  esAdmin = computed(() => this.usuario()?.rol === 'admin');

  iniciarSesion(usuario: Usuario, token: string) {
    this.cambios.next();
    this.tokenActual.set(token);
    sessionStorage.setItem('rentify_token', token);
    this.actualizarUsuario(usuario);
  }

  actualizarUsuario(usuario: Usuario) {
    this.verificada = true;
    this.usuarioActual.set(usuario);

    sessionStorage.setItem(this.clave, JSON.stringify(usuario));
  }

  cerrarSesion() {
    this.cambios.next();
    this.verificada = false;
    this.tokenActual.set(null);
    this.usuarioActual.set(null);
    sessionStorage.removeItem(this.clave);
    sessionStorage.removeItem('rentify_token');
    sessionStorage.removeItem('rentify_carrito');
  }

  necesitaVerificar() { return !this.verificada; }

  private recuperarToken(): string | null {
    const token = sessionStorage.getItem('rentify_token');
    return token && /^[a-f0-9]{64}$/.test(token) ? token : null;
  }

  private recuperarUsuario(): Usuario | null {
    const datos = sessionStorage.getItem(this.clave);

    if (!datos || !this.token()) {
      return null;
    }

    try {
      const usuario = JSON.parse(datos);
      if (
        !usuario ||
        !Number.isSafeInteger(usuario.id) ||
        usuario.id <= 0 ||
        typeof usuario.nombre !== 'string' ||
        typeof usuario.email !== 'string' ||
        !['usuario', 'admin'].includes(usuario.rol)
      )
        return null;
      return usuario;
    } catch {
      return null;
    }
  }
}
