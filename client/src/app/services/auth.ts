
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

export interface RespuestaLogin {
  mensaje: string;
  usuario: Usuario;
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

}
