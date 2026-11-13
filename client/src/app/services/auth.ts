import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface DatosRegistro {
  nombre: string;
  email: string;
  password: string;
}

export interface Usuario {
  id: number;
  nombre: string;
  email: string;
  rol: string;
}

export interface RespuestaRegistro {
  mensaje: string;
  usuario: Usuario;
}

export interface DatosLogin {
  email: string;
  password: string;
}

export interface DatosPerfil {
  password: string;
  nombre: string;
  email: string;
}

export interface RespuestaLogin {
  mensaje: string;
  usuario: Usuario;
  token: string;
}

@Injectable({
  providedIn: 'root'
})
export class Auth {

  private http = inject(HttpClient);

  private apiUrl = 'http://localhost:3000/api/auth';

  registrar(datos: DatosRegistro): Observable<RespuestaRegistro> {
    return this.http.post<RespuestaRegistro>(
      `${this.apiUrl}/registro`,
      datos
    );
  }

  login(datos: DatosLogin): Observable<RespuestaLogin> {
  return this.http.post<RespuestaLogin>(
    `${this.apiUrl}/login`,
    datos
    );
  }

  actualizarPerfil(datos: DatosPerfil): Observable<RespuestaRegistro> {
    return this.http.put<RespuestaRegistro>(`${this.apiUrl}/perfil`, datos);
  }

  comprobarSesion(): Observable<{ usuario: Usuario }> {
    return this.http.get<{ usuario: Usuario }>(`${this.apiUrl}/me`);
  }

  cerrarSesion(): Observable<{ mensaje: string }> {
    return this.http.post<{ mensaje: string }>(`${this.apiUrl}/logout`, {});
  }

}
