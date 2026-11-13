const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const app = require('../src/index');
const sesiones = require('../src/repositories/sesion.repository');
let server;
let base;
let admin;
let ana;
let bob;
const entornoAnterior = {
    email: process.env.RENTIFY_ADMIN_EMAIL,
    password: process.env.RENTIFY_ADMIN_PASSWORD
};
const clavePrueba = 'ClaveSoloParaTests123';

async function request(path, method = 'GET', body, token, headers = {}) {
    const response = await fetch(`${base}${path}`, {
        method,
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...headers },
        body: body === undefined ? undefined : JSON.stringify(body)
    });
    return { status: response.status, data: await response.json(), headers: response.headers };
}

async function registrar(email, nombre = 'Prueba') {
    const datos = { nombre, email, password: clavePrueba };
    const registro = await request('/auth/registro', 'POST', datos);
    assert.equal(registro.status, 201);
    assert.equal(registro.data.usuario.passwordHash, undefined);
    const login = await request('/auth/login', 'POST', datos);
    assert.equal(login.status, 200);
    assert.match(login.data.token, /^[a-f0-9]{64}$/);
    return { ...login.data, email };
}

async function crearVivienda() {
    const respuesta = await request('/viviendas', 'POST', { titulo: ' Casa para prueba ', precio: 500 }, admin.token);
    assert.equal(respuesta.status, 201);
    return respuesta.data;
}

before(async () => {
    process.env.RENTIFY_ADMIN_EMAIL = 'admin@rentify.test';
    process.env.RENTIFY_ADMIN_PASSWORD = clavePrueba;
    server = app.listen(0, '127.0.0.1');
    await new Promise(resolve => server.once('listening', resolve));
    base = `http://127.0.0.1:${server.address().port}/api`;
    admin = await registrar('admin@rentify.test', 'Admin');
    ana = await registrar('ana@rentify.test', 'Ana');
    bob = await registrar('bob@rentify.test', 'Bob');
});

after(async () => {
    await new Promise(resolve => server.close(resolve));
    for (const [clave, valor] of Object.entries({ RENTIFY_ADMIN_EMAIL: entornoAnterior.email, RENTIFY_ADMIN_PASSWORD: entornoAnterior.password })) {
        if (valor === undefined) delete process.env[clave];
        else process.env[clave] = valor;
    }
});

test('API, CORS, rutas desconocidas y errores JSON tienen respuestas coherentes', async () => {
    assert.equal((await request('')).status, 200);
    assert.equal((await request('/no-existe')).status, 404);
    const cors = await request('/viviendas', 'GET', undefined, ana.token, { Origin: 'http://localhost:4200' });
    assert.equal(cors.headers.get('access-control-allow-origin'), 'http://localhost:4200');
    const preflight = await fetch(`${base}/viviendas`, { method: 'OPTIONS', headers: {
        Origin: 'http://localhost:4200', 'Access-Control-Request-Method': 'POST', 'Access-Control-Request-Headers': 'authorization,content-type'
    } });
    assert.equal(preflight.status, 204);
    assert.match(preflight.headers.get('access-control-allow-headers'), /authorization/);
    const malformada = await fetch(`${base}/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{' });
    assert.equal(malformada.status, 400);
    assert.equal((await malformada.json()).mensaje, 'El cuerpo debe contener JSON válido');
});

test('registro y login validan datos y bcrypt no acepta contraseñas truncadas', async () => {
    const datos = { nombre: 'Validación', email: 'validacion@rentify.test', password: clavePrueba };
    for (const incorrectos of [null, {}, { ...datos, nombre: ' ' }, { ...datos, email: 'correo' }, { ...datos, password: 'corta' }, { ...datos, password: 'á'.repeat(37) }]) {
        assert.equal((await request('/auth/registro', 'POST', incorrectos)).status, 400);
    }
    const concurrencia = await Promise.all([request('/auth/registro', 'POST', datos), request('/auth/registro', 'POST', datos)]);
    assert.deepEqual(concurrencia.map(r => r.status).sort(), [201, 400]);
    assert.equal((await request('/auth/login', 'POST', { email: ana.email, password: 'incorrecta' })).status, 401);
    assert.equal((await request('/auth/login', 'POST', { email: ana.email, password: 'a'.repeat(73) })).status, 401);
    assert.equal((await request('/auth/login', 'POST', { email: 'noexiste@rentify.test', password: clavePrueba })).status, 401);
    assert.equal((await request('/auth/login', 'POST', null)).status, 400);
    const normalizado = await request('/auth/login', 'POST', { email: ' ANA@RENTIFY.TEST ', password: clavePrueba });
    assert.equal(normalizado.status, 200);
    assert.equal(normalizado.data.usuario.passwordHash, undefined);
});

test('el administrador requiere correo y clave de configuración; un rol enviado no concede permisos', async () => {
    assert.equal(admin.usuario.rol, 'admin');
    process.env.RENTIFY_ADMIN_EMAIL = 'reservado@rentify.test';
    try {
        delete process.env.RENTIFY_ADMIN_PASSWORD;
        assert.equal((await request('/auth/registro', 'POST', { nombre: 'Intento', email: 'reservado@rentify.test', password: clavePrueba })).status, 400);
        process.env.RENTIFY_ADMIN_PASSWORD = clavePrueba;
        assert.equal((await request('/auth/registro', 'POST', { nombre: 'Intento', email: 'reservado@rentify.test', password: 'OtraClave123' })).status, 400);
        const falso = await request('/auth/registro', 'POST', { nombre: 'Normal', email: 'normal@rentify.test', password: clavePrueba, rol: 'admin', id: 1 });
        assert.equal(falso.status, 201);
        assert.equal(falso.data.usuario.rol, 'usuario');
        assert.notEqual(falso.data.usuario.id, admin.usuario.id);
    } finally {
        process.env.RENTIFY_ADMIN_EMAIL = 'admin@rentify.test';
        process.env.RENTIFY_ADMIN_PASSWORD = clavePrueba;
    }
});

test('el servidor rechaza peticiones sin token, tokens falsos y tokens caducados', async () => {
    for (const [path, method] of [['/viviendas', 'GET'], ['/viviendas', 'POST'], ['/reservas', 'GET'], ['/reservas', 'POST'], ['/auth/perfil', 'PUT'], ['/auth/me', 'GET'], ['/auth/logout', 'POST']]) {
        assert.equal((await request(path, method, method === 'GET' ? undefined : {})).status, 401);
        assert.equal((await request(path, method, method === 'GET' ? undefined : {}, 'f'.repeat(64))).status, 401);
    }
    const caducado = 'e'.repeat(64);
    sesiones.guardar(caducado, { usuarioId: ana.usuario.id, expiraEn: Date.now() - 1 });
    assert.equal((await request('/auth/me', 'GET', undefined, caducado)).status, 401);
    assert.equal((await request('/auth/me', 'GET', undefined, ana.token)).data.usuario.id, ana.usuario.id);
});

test('CRUD de viviendas solo permite mutaciones al administrador y valida IDs y datos', async () => {
    const vivienda = await crearVivienda();
    assert.equal(vivienda.titulo, 'Casa para prueba');
    assert.equal((await request(`/viviendas/${vivienda.id}`, 'GET', undefined, ana.token)).status, 200);
    assert.ok((await request('/viviendas', 'GET', undefined, ana.token)).data.some(v => v.id === vivienda.id));
    for (const [path, method] of [['/viviendas', 'POST'], [`/viviendas/${vivienda.id}`, 'PUT'], [`/viviendas/${vivienda.id}`, 'DELETE']]) {
        assert.equal((await request(path, method, { titulo: 'Fraude', precio: 50, rol: 'admin' }, ana.token, { 'X-Role': 'admin', 'X-User-Id': String(admin.usuario.id) })).status, 403);
    }
    for (const id of ['abc', '0', '-1', '1.5', '1e2', '9007199254740992']) {
        assert.equal((await request(`/viviendas/${id}`, 'GET', undefined, admin.token)).status, 400);
    }
    for (const datos of [{ titulo: ' ', precio: 10 }, { titulo: 'Casa', precio: 0 }, { titulo: 'Casa', precio: -1 }, { titulo: 'Casa', precio: '50' }, null]) {
        assert.equal((await request('/viviendas', 'POST', datos, admin.token)).status, 400);
    }
    const actualizada = await request(`/viviendas/${vivienda.id}`, 'PUT', { titulo: 'Casa editada', precio: 550 }, admin.token);
    assert.equal(actualizada.data.precio, 550);
    assert.equal((await request(`/viviendas/${vivienda.id}`, 'DELETE', undefined, admin.token)).status, 200);
    assert.equal((await request(`/viviendas/${vivienda.id}`, 'GET', undefined, admin.token)).status, 404);
    assert.equal((await request(`/viviendas/${vivienda.id}`, 'PUT', { titulo: 'Casa', precio: 50 }, admin.token)).status, 404);
    assert.equal((await request(`/viviendas/${vivienda.id}`, 'DELETE', undefined, admin.token)).status, 404);
    assert.ok((await crearVivienda()).id > vivienda.id);
});

test('CRUD de reservas respeta propietario, no permite suplantar usuario ni confirmar como usuario', async () => {
    const vivienda = await crearVivienda();
    const datos = { viviendaId: vivienda.id, usuarioId: bob.usuario.id, fechaInicio: '2026-12-01', fechaFin: '2026-12-10' };
    const creada = await request('/reservas', 'POST', { ...datos, estado: 'confirmada' }, ana.token);
    assert.equal(creada.status, 201);
    assert.equal(creada.data.usuarioId, ana.usuario.id);
    assert.equal(creada.data.estado, 'pendiente');
    const id = creada.data.id;
    assert.ok((await request('/reservas', 'GET', undefined, ana.token)).data.some(r => r.id === id));
    assert.ok(!(await request('/reservas', 'GET', undefined, bob.token)).data.some(r => r.id === id));
    assert.ok((await request('/reservas', 'GET', undefined, admin.token)).data.some(r => r.id === id));
    for (const method of ['GET', 'PUT', 'DELETE']) {
        assert.equal((await request(`/reservas/${id}`, method, method === 'PUT' ? { ...datos, estado: 'cancelada' } : undefined, bob.token)).status, 403);
    }
    assert.equal((await request(`/reservas/${id}`, 'PUT', { ...datos, estado: 'confirmada' }, ana.token)).status, 403);
    const editada = await request(`/reservas/${id}`, 'PUT', { ...datos, estado: 'pendiente', fechaFin: '2026-12-11' }, ana.token);
    assert.equal(editada.status, 200);
    assert.equal(editada.data.usuarioId, ana.usuario.id);
    assert.equal(editada.data.fechaFin, '2026-12-11');
    const confirmada = await request(`/reservas/${id}`, 'PUT', { ...datos, usuarioId: ana.usuario.id, estado: 'confirmada' }, admin.token);
    assert.equal(confirmada.data.estado, 'confirmada');
    assert.equal((await request(`/reservas/${id}`, 'PUT', { ...datos, estado: 'confirmada' }, ana.token)).status, 200);
    assert.equal((await request(`/reservas/${id}`, 'PUT', { ...datos, estado: 'cancelada' }, ana.token)).data.estado, 'cancelada');
    assert.equal((await request(`/viviendas/${vivienda.id}`, 'DELETE', undefined, admin.token)).status, 409);
    assert.equal((await request(`/reservas/${id}`, 'DELETE', undefined, ana.token)).status, 200);
    assert.equal((await request(`/reservas/${id}`, 'GET', undefined, ana.token)).status, 404);
    assert.equal((await request(`/viviendas/${vivienda.id}`, 'DELETE', undefined, admin.token)).status, 200);
});

test('reservas validan fechas, referencias, estados y solapamientos; permiten estancias contiguas', async () => {
    const vivienda = await crearVivienda();
    const datos = { viviendaId: vivienda.id, usuarioId: ana.usuario.id, fechaInicio: '2026-12-01', fechaFin: '2026-12-10' };
    for (const cambio of [{ fechaInicio: '2026-02-30' }, { fechaInicio: '2026-12-10' }, { fechaInicio: '2026-12-11' }, { fechaInicio: '01-12-2026' }, { fechaInicio: null }, { usuarioId: 999999 }, { viviendaId: 999999 }, { viviendaId: 1.5 }]) {
        assert.equal((await request('/reservas', 'POST', { ...datos, ...cambio }, admin.token)).status, 400);
    }
    const creada = await request('/reservas', 'POST', datos, admin.token);
    assert.equal(creada.status, 201);
    assert.equal((await request('/reservas', 'POST', datos, admin.token)).status, 400);
    assert.equal((await request(`/reservas/${creada.data.id}`, 'PUT', { ...datos, estado: 'invalido' }, admin.token)).status, 400);
    const contigua = await request('/reservas', 'POST', { ...datos, fechaInicio: '2026-12-10', fechaFin: '2026-12-20' }, admin.token);
    assert.equal(contigua.status, 201);
    assert.equal((await request(`/reservas/${creada.data.id}`, 'PUT', { ...datos, fechaFin: '2026-12-11', estado: 'pendiente' }, admin.token)).status, 400);
    assert.equal((await request(`/reservas/${creada.data.id}`, 'PUT', { ...datos, estado: 'cancelada' }, admin.token)).status, 200);
    assert.equal((await request('/reservas', 'POST', datos, admin.token)).status, 201);
    for (const method of ['GET', 'PUT', 'DELETE']) {
        assert.equal((await request('/reservas/999999', method, method === 'PUT' ? datos : undefined, admin.token)).status, 404);
        assert.equal((await request('/reservas/no-valido', method, method === 'PUT' ? datos : undefined, admin.token)).status, 400);
    }
});

test('perfil requiere token y contraseña, solo cambia la cuenta autenticada y no eleva rol', async () => {
    const propia = await registrar('perfil@rentify.test', 'Perfil');
    const cambios = { nombre: 'Nombre nuevo', email: 'perfilnuevo@rentify.test', password: clavePrueba, emailActual: bob.email, rol: 'admin', id: bob.usuario.id };
    assert.equal((await request('/auth/perfil', 'PUT', { ...cambios, password: 'incorrecta' }, propia.token)).status, 400);
    assert.equal((await request('/auth/perfil', 'PUT', { ...cambios, email: bob.email }, propia.token)).status, 400);
    assert.equal((await request('/auth/perfil', 'PUT', { ...cambios, nombre: ' ' }, propia.token)).status, 400);
    const correoAdmin = process.env.RENTIFY_ADMIN_EMAIL;
    process.env.RENTIFY_ADMIN_EMAIL = 'reservado-libre@rentify.test';
    try {
        assert.equal((await request('/auth/perfil', 'PUT', { ...cambios, email: process.env.RENTIFY_ADMIN_EMAIL }, propia.token)).status, 400);
    } finally {
        process.env.RENTIFY_ADMIN_EMAIL = correoAdmin;
    }
    const actualizada = await request('/auth/perfil', 'PUT', cambios, propia.token);
    assert.equal(actualizada.status, 200);
    assert.equal(actualizada.data.usuario.id, propia.usuario.id);
    assert.equal(actualizada.data.usuario.rol, 'usuario');
    assert.equal(actualizada.data.usuario.passwordHash, undefined);
    assert.equal((await request('/auth/me', 'GET', undefined, bob.token)).data.usuario.nombre, 'Bob');
    assert.equal((await request('/auth/me', 'GET', undefined, propia.token)).data.usuario.nombre, 'Nombre nuevo');
    assert.equal((await request('/auth/login', 'POST', { email: cambios.email, password: clavePrueba })).status, 200);
    assert.equal((await request('/auth/login', 'POST', { email: propia.email, password: clavePrueba })).status, 401);
});

test('logout revoca el token en el servidor y no solo el estado de Angular', async () => {
    const cuenta = await registrar('logout@rentify.test');
    assert.equal((await request('/auth/logout', 'POST', {}, cuenta.token)).status, 200);
    assert.equal((await request('/auth/me', 'GET', undefined, cuenta.token)).status, 401);
    assert.equal((await request('/viviendas', 'GET', undefined, cuenta.token)).status, 401);
});
