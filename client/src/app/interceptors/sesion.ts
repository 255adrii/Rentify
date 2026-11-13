import { inject } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { Sesion } from '../services/sesion';

export const sesionInterceptor: HttpInterceptorFn = (request, next) => {
  const sesion = inject(Sesion);
  const router = inject(Router);
  const esApi = request.url.startsWith('http://localhost:3000/api/');
  const esPublica = /\/auth\/(login|registro)$/.test(request.url);
  const token = sesion.token();
  const autenticada = esApi && !esPublica && token !== null;
  const peticion = autenticada ? request.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : request;
  return next(peticion).pipe(catchError(error => {
    // Una respuesta de una sesión anterior no debe cerrar una sesión nueva.
    if (autenticada && error.status === 401 && sesion.token() === token) {
      sesion.cerrarSesion();
      void router.navigate(['/login']);
    }
    return throwError(() => error);
  }));
};
