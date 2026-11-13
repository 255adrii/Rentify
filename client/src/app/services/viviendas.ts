import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Vivienda {
  id: number;
  titulo: string;
  precio: number;
}

export interface DatosVivienda {
  titulo: string;
  precio: number;
}

@Injectable({
  providedIn: 'root'
})
export class Viviendas {

  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/api/viviendas';

  obtenerTodas(): Observable<Vivienda[]> {
    return this.http.get<Vivienda[]>(this.apiUrl);
  }

  obtenerPorId(id: number): Observable<Vivienda> {
    return this.http.get<Vivienda>(`${this.apiUrl}/${id}`);
  }

  crear(datos: DatosVivienda): Observable<Vivienda> {
    return this.http.post<Vivienda>(this.apiUrl, datos);
  }

  actualizar(id: number, datos: DatosVivienda): Observable<Vivienda> {
    return this.http.put<Vivienda>(`${this.apiUrl}/${id}`, datos);
  }

  eliminar(id: number): Observable<{ mensaje: string }> {
    return this.http.delete<{ mensaje: string }>(`${this.apiUrl}/${id}`);
  }
}
