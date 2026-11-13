import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { catchError, map, Observable, of } from 'rxjs';
import { Sesion } from '../services/sesion';
import { Auth } from '../services/auth';

function comprobarAcceso(admin: boolean): Observable<boolean | UrlTree> {
  const sesion = inject(Sesion);
  const auth = inject(Auth);
  const router = inject(Router);
  const destino = () => !sesion.estaLogueado()
    ? router.createUrlTree(['/login'])
    : admin && !sesion.esAdmin() ? router.createUrlTree(['/dashboard']) : true;
  if (!sesion.token() || !sesion.necesitaVerificar()) return of(destino());
  // Tras recargar, el servidor valida token e identidad; sessionStorage no acredita el rol.
  return auth.comprobarSesion().pipe(
    map(respuesta => { sesion.actualizarUsuario(respuesta.usuario); return destino(); }),
    catchError(() => of(router.createUrlTree(['/login'])))
  );
}

export const requiereSesion: CanActivateFn = () => comprobarAcceso(false);
export const requiereAdmin: CanActivateFn = () => comprobarAcceso(true);
