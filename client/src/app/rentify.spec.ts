import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { sesionInterceptor } from './interceptors/sesion';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { routes } from './app.routes';
import { Sesion } from './services/sesion';
import { Carrito } from './services/carrito';
import { ViviendaFormulario } from './components/vivienda-formulario/vivienda-formulario';
import { ViviendasLista } from './components/viviendas-lista/viviendas-lista';
import { ReservasLista } from './components/reservas-lista/reservas-lista';
import { ReservaFormulario } from './components/reserva-formulario/reserva-formulario';
import { Carrito as CarritoPagina } from './components/carrito/carrito';
import { Perfil } from './components/perfil/perfil';
import { ViviendaDetalle } from './components/vivienda-detalle/vivienda-detalle';
import { Menu } from './components/menu/menu';
import { Login } from './components/login/login';
import { Registro } from './components/registro/registro';

const api = 'http://localhost:3000/api';
const token = 'a'.repeat(64);
const usuario = { id: 1, nombre: 'Ana', email: 'ana@rentify.test', rol: 'usuario' };
const vivienda = { id: 1, titulo: 'Piso en Madrid', precio: 950 };
const otra = { id: 2, titulo: 'Apartamento', precio: 750 };
const reserva = {
  id: 1,
  viviendaId: 1,
  usuarioId: 1,
  fechaInicio: '2026-12-01',
  fechaFin: '2026-12-10',
  estado: 'pendiente',
};

describe('Flujos de Rentify', () => {
  let http: HttpTestingController;
  let sesion: Sesion;
  beforeEach(() => {
    sessionStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideRouter(routes), provideHttpClient(withInterceptors([sesionInterceptor])), provideHttpClientTesting()],
    });
    http = TestBed.inject(HttpTestingController);
    sesion = TestBed.inject(Sesion);
    sesion.iniciarSesion(usuario, token);
  });
  afterEach(() => {
    http.verify();
    sessionStorage.clear();
  });

  it('el contador del menú refleja las señales al añadir y quitar viviendas', () => {
    const fixture = TestBed.createComponent(Menu);
    const carrito = TestBed.inject(Carrito);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Carrito (0)');
    carrito.agregar(vivienda);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Carrito (1)');
    carrito.eliminar(vivienda.id);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Carrito (0)');
  });

  it('el formulario login bloquea datos inválidos y guarda el token tras un envío válido', async () => {
    const harness = await RouterTestingHarness.create();
    const pagina = await harness.navigateByUrl('/login', Login);
    harness.routeNativeElement!.querySelector('form')!.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    http.expectNone(`${api}/auth/login`);
    expect(pagina.formulario.touched).toBe(true);
    pagina.formulario.setValue({ email: usuario.email, password: 'Prueba1234' });
    harness.routeNativeElement!.querySelector('form')!.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    const request = http.expectOne(`${api}/auth/login`);
    expect(request.request.method).toBe('POST');
    request.flush({ mensaje: 'Correcto', usuario, token });
    await harness.fixture.whenStable();
    http.expectOne(`${api}/viviendas`).flush([]);
    http.expectOne(`${api}/reservas`).flush([]);
    expect(sesion.token()).toBe(token);
  });

  it('registro valida nombre, email y contraseña y envía un formulario válido', async () => {
    const harness = await RouterTestingHarness.create();
    const pagina = await harness.navigateByUrl('/registro', Registro);
    pagina.formulario.setValue({ nombre: ' ', email: 'incorrecto', password: 'corta' });
    harness.routeNativeElement!.querySelector('form')!.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    http.expectNone(`${api}/auth/registro`);
    expect(pagina.formulario.invalid).toBe(true);
    pagina.formulario.setValue({ nombre: 'Ana', email: usuario.email, password: 'Prueba1234' });
    harness.routeNativeElement!.querySelector('form')!.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    const request = http.expectOne(`${api}/auth/registro`);
    expect(request.request.method).toBe('POST');
    request.flush({ mensaje: 'Registrado', usuario });
    await harness.fixture.whenStable();
    expect(TestBed.inject(Router).url).toBe('/login');
  });

  it('/viviendas/nueva abre creación sin interpretar nueva como un ID', async () => {
    sesion.iniciarSesion({ ...usuario, rol: 'admin' }, token);
    const harness = await RouterTestingHarness.create();
    const pagina = await harness.navigateByUrl('/viviendas/nueva', ViviendaFormulario);
    expect(pagina.modoEdicion()).toBe(false);
    expect(harness.routeNativeElement?.textContent).toContain('Añadir vivienda');
    http.expectNone(`${api}/viviendas/NaN`);
  });

  it('redirige a login al entrar sin sesión en una ruta privada', async () => {
    sesion.cerrarSesion();
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/reservas');
    expect(TestBed.inject(Router).url).toBe('/login');
  });

  it('un usuario normal no puede abrir administración desde Angular', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/administracion');
    http.expectOne(`${api}/viviendas`).flush([]);
    http.expectOne(`${api}/reservas`).flush([]);
    expect(TestBed.inject(Router).url).toBe('/dashboard');
  });

  it('edita una vivienda cargando y enviando sus datos al endpoint existente', async () => {
    sesion.iniciarSesion({ ...usuario, rol: 'admin' }, token);
    const harness = await RouterTestingHarness.create();
    const pagina = await harness.navigateByUrl('/viviendas/editar/1', ViviendaFormulario);
    http.expectOne(`${api}/viviendas/1`).flush(vivienda);
    pagina.formulario.setValue({ titulo: ' Piso actualizado ', precio: 900 });
    pagina.guardar();
    const peticion = http.expectOne(`${api}/viviendas/1`);
    expect(peticion.request.method).toBe('PUT');
    expect(peticion.request.body).toEqual({ titulo: 'Piso actualizado', precio: 900 });
    peticion.flush({ ...vivienda, titulo: 'Piso actualizado', precio: 900 });
    await harness.fixture.whenStable();
    http.expectOne(`${api}/viviendas`).flush([]);
  });

  it('filtra y ordena viviendas y las elimina con confirmación', async () => {
    sesion.iniciarSesion({ ...usuario, rol: 'admin' }, token);
    const harness = await RouterTestingHarness.create();
    const pagina = await harness.navigateByUrl('/viviendas', ViviendasLista);
    http.expectOne(`${api}/viviendas`).flush([vivienda, otra]);
    pagina.orden.set('precio-asc');
    expect(pagina.viviendasVisibles().map((v) => v.id)).toEqual([2, 1]);
    pagina.busqueda.set('madrid');
    expect(pagina.viviendasVisibles()).toEqual([vivienda]);
    const confirmar = vi.spyOn(window, 'confirm').mockReturnValue(true);
    pagina.eliminar(vivienda);
    const peticion = http.expectOne(`${api}/viviendas/1`);
    expect(peticion.request.method).toBe('DELETE');
    peticion.flush({ mensaje: 'Eliminada' });
    expect(pagina.viviendasVisibles()).toEqual([]);
    confirmar.mockRestore();
  });

  it('renderiza reservas en tabla y filtra por usuario, texto y estado', async () => {
    const harness = await RouterTestingHarness.create();
    const pagina = await harness.navigateByUrl('/reservas', ReservasLista);
    http
      .expectOne(`${api}/reservas`)
      .flush([
        reserva,
        { ...reserva, id: 2, usuarioId: 2 },
        { ...reserva, id: 3, estado: 'confirmada', fechaInicio: '2026-12-20' },
      ]);
    http.expectOne(`${api}/viviendas`).flush([vivienda]);
    pagina.orden.set('inicio-desc');
    expect(pagina.visibles().map((r) => r.id)).toEqual([3, 1]);
    pagina.busqueda.set('Madrid');
    pagina.estado.set('pendiente');
    harness.detectChanges();
    expect(pagina.visibles().map((r) => r.id)).toEqual([1]);
    expect(harness.routeNativeElement?.querySelectorAll('tbody tr').length).toBe(1);
    expect(harness.routeNativeElement?.querySelector('table')?.textContent).toContain(
      'Piso en Madrid',
    );
  });

  it('impide enviar una reserva con fechas invertidas y la crea al corregirlas', async () => {
    const harness = await RouterTestingHarness.create();
    const pagina = await harness.navigateByUrl('/reservas/nueva', ReservaFormulario);
    http.expectOne(`${api}/viviendas`).flush([vivienda]);
    pagina.formulario.patchValue({
      viviendaId: 1,
      fechaInicio: '2026-12-10',
      fechaFin: '2026-12-01',
    });
    pagina.guardar();
    http.expectNone(`${api}/reservas`);
    expect(pagina.formulario.hasError('fechas')).toBe(true);
    pagina.formulario.patchValue({ fechaFin: '2026-12-20' });
    pagina.guardar();
    const peticion = http.expectOne(`${api}/reservas`);
    expect(peticion.request.method).toBe('POST');
    expect(peticion.request.body.usuarioId).toBe(usuario.id);
    peticion.flush(reserva);
    await harness.fixture.whenStable();
    http.expectOne(`${api}/reservas`).flush([]);
    http.expectOne(`${api}/viviendas`).flush([]);
  });

  it('el carrito evita duplicados, actualiza el contador y se vacía al salir', () => {
    const carrito = TestBed.inject(Carrito);
    carrito.agregar(vivienda);
    carrito.agregar(vivienda);
    carrito.agregar(otra);
    TestBed.tick();
    expect(carrito.cantidad()).toBe(2);
    expect(carrito.totalMensual()).toBe(1700);
    expect(JSON.parse(sessionStorage.getItem('rentify_carrito')!).viviendas.length).toBe(2);
    sesion.cerrarSesion();
    TestBed.tick();
    expect(carrito.cantidad()).toBe(0);
    expect(sessionStorage.getItem('rentify_carrito')).toBeNull();
    sesion.iniciarSesion(usuario, token);
    TestBed.tick();
    expect(carrito.cantidad()).toBe(0);
  });

  it('el carrito conserva fallos y no vuelve a enviar las reservas que ya creó', async () => {
    const carrito = TestBed.inject(Carrito);
    carrito.agregar(vivienda);
    carrito.agregar(otra);
    const harness = await RouterTestingHarness.create();
    const pagina = await harness.navigateByUrl('/carrito', CarritoPagina);
    pagina.formulario.setValue({ fechaInicio: '2026-12-01', fechaFin: '2026-12-10' });
    pagina.confirmar();
    pagina.confirmar();
    http.expectOne(`${api}/reservas`).flush(reserva);
    const segunda = http.expectOne(`${api}/reservas`);
    expect(segunda.request.body.viviendaId).toBe(2);
    segunda.flush({ mensaje: 'Ya reservada' }, { status: 400, statusText: 'Bad Request' });
    expect(carrito.viviendas()).toEqual([otra]);
    expect(pagina.errores()[0]).toContain('Ya reservada');
    pagina.confirmar();
    const reintento = http.expectOne(`${api}/reservas`);
    expect(reintento.request.body.viviendaId).toBe(2);
    reintento.flush({ ...reserva, id: 2, viviendaId: 2 });
    expect(carrito.cantidad()).toBe(0);
  });

  it('actualiza el perfil en la API y refleja el nombre nuevo en la sesión', async () => {
    const harness = await RouterTestingHarness.create();
    const pagina = await harness.navigateByUrl('/perfil', Perfil);
    pagina.formulario.setValue({
      nombre: 'Ana nueva',
      email: usuario.email,
      password: 'ClavePrueba123',
    });
    pagina.guardar();
    const peticion = http.expectOne(`${api}/auth/perfil`);
    expect(peticion.request.method).toBe('PUT');
    expect(peticion.request.headers.get('Authorization')).toBe(`Bearer ${token}`);
    expect(peticion.request.body.emailActual).toBeUndefined();
    peticion.flush({ mensaje: 'Actualizado', usuario: { ...usuario, nombre: 'Ana nueva' } });
    expect(sesion.usuario()?.nombre).toBe('Ana nueva');
    expect(pagina.formulario.controls.password.value).toBe('');
  });

  it('carga el nuevo detalle al cambiar el parámetro sin destruir el componente', async () => {
    const harness = await RouterTestingHarness.create();
    const primero = await harness.navigateByUrl('/viviendas/1', ViviendaDetalle);
    http.expectOne(`${api}/viviendas/1`).flush(vivienda);
    const segundo = await harness.navigateByUrl('/viviendas/2', ViviendaDetalle);
    http.expectOne(`${api}/viviendas/2`).flush(otra);
    expect(segundo).toBe(primero);
    expect(segundo.vivienda()).toEqual(otra);
  });

  it('recarga ambos formularios de edición cuando cambia su ID', async () => {
    sesion.iniciarSesion({ ...usuario, rol: 'admin' }, token);
    const harness = await RouterTestingHarness.create();
    const viviendaForm = await harness.navigateByUrl('/viviendas/editar/1', ViviendaFormulario);
    http.expectOne(`${api}/viviendas/1`).flush(vivienda);
    await harness.navigateByUrl('/viviendas/editar/2', ViviendaFormulario);
    http.expectOne(`${api}/viviendas/2`).flush(otra);
    expect(viviendaForm.id()).toBe(2);
    expect(viviendaForm.formulario.controls.titulo.value).toBe(otra.titulo);
    const reservaForm = await harness.navigateByUrl('/reservas/editar/1', ReservaFormulario);
    http.expectOne(`${api}/viviendas`).flush([vivienda, otra]);
    http.expectOne(`${api}/reservas/1`).flush(reserva);
    await harness.navigateByUrl('/reservas/editar/2', ReservaFormulario);
    http.expectOne(`${api}/viviendas`).flush([vivienda, otra]);
    http.expectOne(`${api}/reservas/2`).flush({ ...reserva, id: 2, viviendaId: 2 });
    expect(reservaForm.id()).toBe(2);
    expect(reservaForm.formulario.controls.viviendaId.value).toBe(2);
  });

  it('detiene el checkout al cerrar sesión y no reserva con la cuenta siguiente', async () => {
    const carrito = TestBed.inject(Carrito);
    carrito.agregar(vivienda); carrito.agregar(otra);
    const harness = await RouterTestingHarness.create();
    const pagina = await harness.navigateByUrl('/carrito', CarritoPagina);
    pagina.formulario.setValue({ fechaInicio: '2026-12-01', fechaFin: '2026-12-10' });
    pagina.confirmar();
    const pendiente = http.expectOne(`${api}/reservas`);
    sesion.cerrarSesion();
    sesion.iniciarSesion({ ...usuario, id: 2 }, 'b'.repeat(64));
    expect(pendiente.cancelled).toBe(true);
    expect(pagina.enviando()).toBe(false);
    http.expectNone(`${api}/reservas`);
    expect(carrito.cantidad()).toBe(0);
  });

  it('cancela la respuesta de perfil al cerrar sesión para no restaurar la cuenta anterior', async () => {
    const harness = await RouterTestingHarness.create();
    const pagina = await harness.navigateByUrl('/perfil', Perfil);
    pagina.formulario.setValue({ nombre: 'Cambio', email: usuario.email, password: 'Clave1234' });
    pagina.guardar();
    const pendiente = http.expectOne(`${api}/auth/perfil`);
    sesion.cerrarSesion();
    expect(pendiente.cancelled).toBe(true);
    expect(sesion.usuario()).toBeNull();
    expect(sesion.token()).toBeNull();
  });

  it('cancela el checkout al navegar fuera del carrito', async () => {
    TestBed.inject(Carrito).agregar(vivienda);
    const harness = await RouterTestingHarness.create();
    const pagina = await harness.navigateByUrl('/carrito', CarritoPagina);
    pagina.formulario.setValue({ fechaInicio: '2026-12-01', fechaFin: '2026-12-10' });
    pagina.confirmar();
    const pendiente = http.expectOne(`${api}/reservas`);
    await harness.navigateByUrl('/login');
    expect(pendiente.cancelled).toBe(true);
  });

  it('solo adjunta credenciales a la API de Rentify y limpia sesión ante 401 protegido', async () => {
    const httpClient = TestBed.inject(HttpClient);
    httpClient.get('https://ejemplo.test/api/datos').subscribe();
    const externa = http.expectOne('https://ejemplo.test/api/datos');
    expect(externa.request.headers.has('Authorization')).toBe(false);
    externa.flush({});
    httpClient.get(`${api}/viviendas`).subscribe({ error: () => {} });
    const protegida = http.expectOne(`${api}/viviendas`);
    expect(protegida.request.headers.get('Authorization')).toBe(`Bearer ${token}`);
    protegida.flush({ mensaje: 'Sesión caducada' }, { status: 401, statusText: 'Unauthorized' });
    expect(sesion.estaLogueado()).toBe(false);
    expect(sessionStorage.getItem('rentify_token')).toBeNull();
  });
});

describe('Restauración de sesión', () => {
  beforeEach(() => {
    sessionStorage.clear();
    TestBed.configureTestingModule({ providers: [provideRouter(routes), provideHttpClient(withInterceptors([sesionInterceptor])), provideHttpClientTesting()] });
  });
  afterEach(() => { TestBed.inject(HttpTestingController).verify(); sessionStorage.clear(); });

  it('consulta /me y rechaza un rol admin manipulado en sessionStorage', async () => {
    sessionStorage.setItem('rentify_token', token);
    sessionStorage.setItem('rentify_usuario', JSON.stringify({ ...usuario, rol: 'admin' }));
    const http = TestBed.inject(HttpTestingController);
    const harness = await RouterTestingHarness.create();
    const navegacion = harness.navigateByUrl('/administracion');
    await vi.waitFor(() => http.expectOne(`${api}/auth/me`).flush({ usuario }));
    await navegacion;
    http.expectOne(`${api}/viviendas`).flush([]);
    http.expectOne(`${api}/reservas`).flush([]);
    expect(TestBed.inject(Sesion).esAdmin()).toBe(false);
    expect(TestBed.inject(Router).url).toBe('/dashboard');
  });

  it('no recupera una sesión visual antigua sin token', () => {
    sessionStorage.setItem('rentify_usuario', JSON.stringify({ ...usuario, rol: 'admin' }));
    const sesion = TestBed.inject(Sesion);
    expect(sesion.estaLogueado()).toBe(false);
    expect(sesion.esAdmin()).toBe(false);
  });
});
