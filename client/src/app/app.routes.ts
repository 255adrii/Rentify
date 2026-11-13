import { Routes } from '@angular/router';

import { Login } from './components/login/login';
import { Registro } from './components/registro/registro';
import { Dashboard } from './components/dashboard/dashboard';
import { ViviendasLista } from './components/viviendas-lista/viviendas-lista';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'registro', component: Registro },
  { path: 'dashboard', component: Dashboard },
  { path: 'viviendas', component: ViviendasLista },
  { path: '**', redirectTo: 'login' }
];
