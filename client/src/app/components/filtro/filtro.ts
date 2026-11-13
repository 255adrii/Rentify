import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-filtro',
  imports: [],
  templateUrl: './filtro.html',
  styleUrl: './filtro.scss',
})
export class Filtro {
  private static siguienteId = 0;
  id = `buscador-${Filtro.siguienteId++}`;

  @Input() etiqueta = 'Buscar';
  @Input() placeholder = 'Introduce un texto';

  @Output() textoCambiado = new EventEmitter<string>();

  alEscribir(event: Event) {
    const input = event.target as HTMLInputElement;

    this.textoCambiado.emit(input.value);
  }
}
