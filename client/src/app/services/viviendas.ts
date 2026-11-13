import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Vivienda {
  id: number;
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
}
