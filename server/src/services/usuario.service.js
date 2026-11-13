
const bcrypt = require('bcrypt');
const { timingSafeEqual } = require('node:crypto');
const usuarioRepository = require('../repositories/usuario.repository');

const registrar = async (datosUsuario) => {
    const { nombre, email, password } = datosUsuario || {};

    // Validar el nombre
    if (typeof nombre !== 'string' || nombre.trim() === '') {
        throw new Error('El nombre es obligatorio');
    }

    // Validar el correo electrónico
    if (
        typeof email !== 'string' ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
    ) {
        throw new Error('El email no es válido');
    }

    const emailNormalizado = email.trim().toLowerCase();

    // Comprobar si el email ya existe
    if (usuarioRepository.buscarPorEmail(emailNormalizado)) {
        throw new Error('El email ya está registrado');
    }

    // Validar la contraseña
    if (typeof password !== 'string' || password.length < 8) {
        throw new Error('La contraseña debe tener al menos 8 caracteres');
    }
    if (Buffer.byteLength(password, 'utf8') > 72) {
        throw new Error('La contraseña no puede superar 72 bytes en UTF-8');
    }

    const esAdmin = emailNormalizado === process.env.RENTIFY_ADMIN_EMAIL?.trim().toLowerCase();
    if (esAdmin) {
        const claveAdmin = process.env.RENTIFY_ADMIN_PASSWORD;
        if (!claveAdmin || claveAdmin.length < 8 || Buffer.byteLength(claveAdmin, 'utf8') > 72) {
            throw new Error('El servidor debe configurar RENTIFY_ADMIN_PASSWORD (8 caracteres como mínimo y 72 bytes como máximo) antes de registrar al administrador');
        }
        const configurada = Buffer.from(claveAdmin, 'utf8');
        const recibida = Buffer.from(password, 'utf8');
        if (configurada.length !== recibida.length || !timingSafeEqual(configurada, recibida)) {
            throw new Error('No se puede registrar esta cuenta con las credenciales indicadas');
        }
    }

    // Generar el hash de la contraseña
    const passwordHash = await bcrypt.hash(password, 10);

    // Guardar el usuario
    const nuevoUsuario = usuarioRepository.crear({
        nombre: nombre.trim(),
        email: emailNormalizado,
        passwordHash,
        // Solo la configuración del servidor puede conceder el rol administrador.
        rol: esAdmin ? 'admin' : 'usuario'
    });

    // Devolver únicamente los datos públicos
    return {
        id: nuevoUsuario.id,
        nombre: nuevoUsuario.nombre,
        email: nuevoUsuario.email,
        rol: nuevoUsuario.rol
    };
};

const login = async (datosLogin) => {
    const { email, password } = datosLogin || {};

    if (
        typeof email !== 'string' ||
        typeof password !== 'string' || Buffer.byteLength(password, 'utf8') > 72
    ) {
        throw new Error('Email y contraseña obligatorios');
    }

    const usuario = usuarioRepository.buscarPorEmail(
        email.trim().toLowerCase()
    );

    if (!usuario) {
        throw new Error('Credenciales incorrectas');
    }

    const passwordCorrecta = await bcrypt.compare(
        password,
        usuario.passwordHash
    );

    if (!passwordCorrecta) {
        throw new Error('Credenciales incorrectas');
    }

    return {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol
    };
};


const actualizarPerfil = async (usuarioId, datos) => {
    const { password, nombre, email } = datos || {};
    // El middleware acredita identidad y la contraseña confirma el cambio sensible.
    const actual = usuarioRepository.buscarPorId(usuarioId);
    const identidad = await login({ email: actual.email, password });
    if (typeof nombre !== 'string' || !nombre.trim()) throw new Error('El nombre es obligatorio');
    if (typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) throw new Error('El email no es válido');
    if (actual.rol !== 'admin' && email.trim().toLowerCase() === process.env.RENTIFY_ADMIN_EMAIL?.trim().toLowerCase()) {
        throw new Error('Este correo está reservado para el administrador');
    }
    const usuario = usuarioRepository.actualizar(identidad.id, { nombre: nombre.trim(), email: email.trim().toLowerCase() });
    return { id: usuario.id, nombre: usuario.nombre, email: usuario.email, rol: usuario.rol };
};

module.exports = { registrar, login, actualizarPerfil };
