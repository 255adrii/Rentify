import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Sesion } from '../../services/sesion';
import { Carrito } from '../../services/carrito';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-menu',
  imports: [RouterLink],
  templateUrl: './menu.html',
  styleUrl: './menu.scss',
})
export class Menu {
  sesion = inject(Sesion);
  carrito = inject(Carrito);
  private router = inject(Router);
  private auth = inject(Auth);

  cerrarSesion() {
    // La petición se suscribe antes de borrar el token local.
    this.auth.cerrarSesion().subscribe({ error: () => {} });
    this.carrito.vaciar();
    this.sesion.cerrarSesion();
    this.router.navigate(['/login']);
  }
}
