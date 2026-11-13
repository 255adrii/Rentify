import { Routes } from '@angular/router';

import { Login } from './components/login/login';
import { Registro } from './components/registro/registro';
import { Dashboard } from './components/dashboard/dashboard';
import { ViviendasLista } from './components/viviendas-lista/viviendas-lista';
import { ViviendaDetalle } from './components/vivienda-detalle/vivienda-detalle';
import { ViviendaFormulario } from './components/vivienda-formulario/vivienda-formulario';
import { ReservasLista } from './components/reservas-lista/reservas-lista';
import { ReservaFormulario } from './components/reserva-formulario/reserva-formulario';
import { Carrito } from './components/carrito/carrito';
import { Perfil } from './components/perfil/perfil';
import { Administracion } from './components/administracion/administracion';
import { requiereAdmin, requiereSesion } from './guards/sesion';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'registro', component: Registro },
  { path: 'dashboard', component: Dashboard, canActivate: [requiereSesion] },
  { path: 'viviendas', component: ViviendasLista, canActivate: [requiereSesion] },
  { path: 'viviendas/nueva', component: ViviendaFormulario, canActivate: [requiereAdmin] },
  { path: 'viviendas/editar/:id', component: ViviendaFormulario, canActivate: [requiereAdmin] },
  { path: 'viviendas/:id', component: ViviendaDetalle, canActivate: [requiereSesion] },
  { path: 'reservas', component: ReservasLista, canActivate: [requiereSesion] },
  { path: 'reservas/nueva', component: ReservaFormulario, canActivate: [requiereSesion] },
  { path: 'reservas/editar/:id', component: ReservaFormulario, canActivate: [requiereSesion] },
  { path: 'carrito', component: Carrito, canActivate: [requiereSesion] },
  { path: 'perfil', component: Perfil, canActivate: [requiereSesion] },
  { path: 'administracion', component: Administracion, canActivate: [requiereAdmin] },
  { path: '**', redirectTo: 'dashboard' },
];
