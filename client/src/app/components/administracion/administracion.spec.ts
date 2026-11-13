import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Administracion } from './administracion';
import { Dashboard } from '../dashboard/dashboard';
import { Sesion } from '../../services/sesion';
import { Reserva } from '../../services/reservas';

const api = 'http://localhost:3000/api';
const vivienda = { id: 1, titulo: 'Vivienda de prueba', precio: 900 };
function reserva(id: number, fechaInicio: string, estado: Reserva['estado']): Reserva {
  return { id, fechaInicio, fechaFin: '2028-12-31', estado, usuarioId: 1, viviendaId: 1 };
}

describe('Resumen de administración', () => {
  let http: HttpTestingController;
  let fixture: ComponentFixture<Administracion>;

  beforeEach(() => {
    sessionStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    });
    http = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(Administracion);
    fixture.detectChanges();
  });
  afterEach(() => {
    http.verify();
    sessionStorage.clear();
  });

  function responder(reservas: Reserva[], viviendas = [vivienda]) {
    http.expectOne(`${api}/viviendas`).flush(viviendas);
    http.expectOne(`${api}/reservas`).flush(reservas);
    fixture.detectChanges();
  }

  it('muestra carga y bloquea peticiones duplicadas antes de recibir ambas respuestas', () => {
    expect(fixture.nativeElement.querySelector('[role="status"]').textContent).toContain(
      'Cargando',
    );
    expect(fixture.nativeElement.querySelector('button').disabled).toBe(true);
    fixture.componentInstance.cargar();
    responder([]);
    expect(fixture.componentInstance.cargando()).toBe(false);
    expect(fixture.nativeElement.querySelector('button').disabled).toBe(false);
  });

  it('calcula los tres indicadores, separa años y ordena meses por fecha de inicio', () => {
    responder([
      reserva(1, '2027-01-15', 'confirmada'),
      reserva(2, '2026-12-10', 'pendiente'),
      reserva(3, '2026-12-20', 'cancelada'),
      reserva(4, '2026-01-10', 'pendiente'),
    ]);
    expect(
      [...fixture.nativeElement.querySelectorAll('dd')].map((el: any) => el.textContent.trim()),
    ).toEqual(['1', '4', '2']);
    expect(fixture.componentInstance.anioGrafico()).toBe(2027);
    const selector = fixture.nativeElement.querySelector('select') as HTMLSelectElement;
    selector.value = '2026';
    selector.dispatchEvent(new Event('change'));
    fixture.detectChanges();
    const meses = fixture.componentInstance.reservasPorMes();
    expect(meses.length).toBe(12);
    expect(meses[0]).toMatchObject({ mes: '2026-01', cantidad: 1 });
    expect(meses[11]).toMatchObject({ mes: '2026-12', cantidad: 2 });
    expect(meses.slice(1, 11).every((m) => m.cantidad === 0)).toBe(true);
    expect(meses[0].etiqueta).toContain('enero');
    expect(fixture.componentInstance.maximoMensual()).toBe(2);
    const barras = fixture.nativeElement.querySelectorAll('.barra');
    expect(barras[0].style.height).toBe('50%');
    expect(barras[1].style.height).toBe('0%');
    expect(barras[11].style.height).toBe('100%');
    expect(fixture.nativeElement.querySelector('figcaption').textContent).toContain(
      'mes de inicio',
    );
  });

  it('muestra ceros reales y un estado vacío sin inventar meses ni barras', () => {
    responder([], []);
    expect(fixture.componentInstance.sinDatos()).toBe(true);
    expect(fixture.nativeElement.textContent).toContain('Tu actividad empieza aquí');
    expect(fixture.nativeElement.textContent).toContain('Aún no hay reservas');
    expect(fixture.nativeElement.querySelector('.barra')).toBeNull();
    expect(fixture.nativeElement.querySelector('svg')).toBeNull();
    expect(
      fixture.componentInstance
        .distribucionEstados()
        .every((s) => s.cantidad === 0 && s.porcentaje === 0),
    ).toBe(true);
    expect(fixture.nativeElement.querySelectorAll('dd').length).toBe(3);
  });

  it('el donut muestra cantidades y porcentajes de todos los años aunque se filtre el gráfico mensual', () => {
    responder([
      reserva(1, '2026-12-01', 'pendiente'),
      reserva(2, '2027-01-01', 'confirmada'),
      reserva(3, '2027-02-01', 'pendiente'),
      reserva(4, '2027-02-02', 'cancelada'),
    ]);
    expect(
      fixture.componentInstance
        .distribucionEstados()
        .map((s) => [s.cantidad, s.porcentaje, s.desplazamiento]),
    ).toEqual([
      [2, 50, -0],
      [1, 25, -50],
      [1, 25, -75],
    ]);
    const leyenda = fixture.nativeElement.querySelector('.leyenda') as HTMLElement;
    expect(leyenda.textContent).toContain('Pendientes');
    expect(leyenda.textContent).toContain('50 %');
    const circulos = fixture.nativeElement.querySelectorAll('circle');
    expect(circulos.length).toBe(3);
    expect(circulos[0].getAttribute('stroke-dasharray')).toBe('50 50');
    fixture.componentInstance.anioSeleccionado.set(2026);
    fixture.detectChanges();
    expect(fixture.componentInstance.distribucionEstados()[0].cantidad).toBe(2);
  });

  it('un único estado ocupa el círculo completo y los demás permanecen en la leyenda con cero', () => {
    responder([reserva(1, '2026-01-01', 'confirmada')]);
    const circulos = fixture.nativeElement.querySelectorAll('circle');
    expect(circulos.length).toBe(1);
    expect(circulos[0].getAttribute('stroke-dasharray')).toBe('100 0');
    expect(fixture.componentInstance.distribucionEstados().map((s) => s.porcentaje)).toEqual([
      0, 100, 0,
    ]);
    expect(fixture.nativeElement.querySelectorAll('.leyenda li').length).toBe(3);
  });

  it('las marcas del eje Y son enteras y cubren el mayor número de reservas', () => {
    responder(Array.from({ length: 9 }, (_, i) => reserva(i + 1, '2026-01-01', 'pendiente')));
    expect(fixture.componentInstance.maximoMensual()).toBe(9);
    expect(fixture.componentInstance.marcasEje()).toEqual([9, 6, 3, 0]);
  });

  it('actualizar datos recalcula tarjetas y ambos gráficos y descarta un año que ya no existe', () => {
    responder([reserva(1, '2026-01-01', 'pendiente')]);
    fixture.componentInstance.anioSeleccionado.set(2026);
    fixture.componentInstance.cargar();
    responder([reserva(2, '2028-02-01', 'confirmada'), reserva(3, '2028-02-10', 'cancelada')], []);
    expect(fixture.componentInstance.anioGrafico()).toBe(2028);
    expect(fixture.componentInstance.reservasPorMes()[1].cantidad).toBe(2);
    expect(fixture.componentInstance.pendientes()).toBe(0);
    expect(fixture.componentInstance.totalReservas()).toBe(2);
    expect(fixture.componentInstance.viviendas()).toBe(0);
    expect(fixture.componentInstance.distribucionEstados().map((s) => s.porcentaje)).toEqual([
      0, 50, 50,
    ]);
    expect(fixture.nativeElement.querySelector('.centro-donut strong').textContent).toBe('2');
    fixture.componentInstance.cargar();
    responder([], []);
    expect(fixture.nativeElement.querySelector('.barra')).toBeNull();
    expect(fixture.nativeElement.querySelector('svg')).toBeNull();
  });

  it('conserva el indicador de viviendas aunque no haya reservas', () => {
    responder([]);
    expect(fixture.componentInstance.sinDatos()).toBe(false);
    expect(fixture.nativeElement.textContent).toContain('Aún no hay reservas');
    expect(fixture.componentInstance.viviendas()).toBe(1);
  });

  it.each(['viviendas', 'reservas'])(
    'un fallo en %s muestra error y permite reintentar sin cifras parciales',
    (entidad) => {
      const viviendas = http.expectOne(`${api}/viviendas`);
      const reservas = http.expectOne(`${api}/reservas`);
      (entidad === 'viviendas' ? viviendas : reservas).flush(
        {},
        { status: 500, statusText: 'Error' },
      );
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('[role="alert"]')).not.toBeNull();
      expect(fixture.nativeElement.querySelector('dd')).toBeNull();
      const boton = [...fixture.nativeElement.querySelectorAll('button')].find(
        (el: any) => el.textContent.trim() === 'Reintentar',
      ) as HTMLButtonElement;
      boton.click();
      responder([reserva(1, '2026-12-01', 'pendiente')]);
      expect(fixture.nativeElement.querySelector('[role="alert"]')).toBeNull();
      expect(fixture.componentInstance.totalReservas()).toBe(1);
    },
  );

  it('reutiliza el panel en el inicio del administrador sin duplicar consultas', () => {
    responder([]);
    fixture.destroy();
    TestBed.inject(Sesion).iniciarSesion(
      { id: 1, nombre: 'Admin', email: 'admin@example.test', rol: 'admin' },
      'a'.repeat(64),
    );
    const inicio = TestBed.createComponent(Dashboard);
    inicio.detectChanges();
    http.expectOne(`${api}/viviendas`).flush([vivienda]);
    http.expectOne(`${api}/reservas`).flush([]);
    inicio.detectChanges();
    expect(inicio.nativeElement.querySelectorAll('app-administracion').length).toBe(1);
    expect(inicio.nativeElement.textContent).toContain('Reservas pendientes');
  });
});
