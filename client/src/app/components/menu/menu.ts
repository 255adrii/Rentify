import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Sesion } from '../../services/sesion';

@Component({
  selector: 'app-menu',
  imports: [RouterLink],
  templateUrl: './menu.html',
  styleUrl: './menu.scss'
})
export class Menu {

  sesion = inject(Sesion);
  private router = inject(Router);

  cerrarSesion() {
    this.sesion.cerrarSesion();
    this.router.navigate(['/login']);
  }
}
