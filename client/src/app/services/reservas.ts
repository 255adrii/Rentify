import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export type EstadoReserva = 'pendiente' | 'confirmada' | 'cancelada';
export interface DatosReserva {
  viviendaId: number;
  usuarioId: number;
  fechaInicio: string;
  fechaFin: string;
}
export interface Reserva extends DatosReserva {
  id: number;
  estado: EstadoReserva;
}

@Injectable({ providedIn: 'root' })
export class Reservas {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/api/reservas';

  obtenerTodas(): Observable<Reserva[]> {
    return this.http.get<Reserva[]>(this.apiUrl);
  }
  obtenerPorId(id: number): Observable<Reserva> {
    return this.http.get<Reserva>(`${this.apiUrl}/${id}`);
  }
  crear(datos: DatosReserva): Observable<Reserva> {
    return this.http.post<Reserva>(this.apiUrl, datos);
  }
  actualizar(id: number, datos: DatosReserva & { estado: EstadoReserva }): Observable<Reserva> {
    return this.http.put<Reserva>(`${this.apiUrl}/${id}`, datos);
  }
  eliminar(id: number): Observable<{ mensaje: string }> {
    return this.http.delete<{ mensaje: string }>(`${this.apiUrl}/${id}`);
  }
}
