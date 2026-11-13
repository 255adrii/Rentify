
const bcrypt = require('bcrypt');
const usuarioRepository = require('../repositories/usuario.repository');

const registrar = async (datosUsuario) => {
    const { nombre, email, password } = datosUsuario;

    // Validar el nombre
    if (typeof nombre !== 'string' || nombre.trim() === '') {
        throw new Error('El nombre es obligatorio');
    }

    // Validar el correo electrónico
    if (
        typeof email !== 'string' ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
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

    // Generar el hash de la contraseña
    const passwordHash = await bcrypt.hash(password, 10);

    // Guardar el usuario
    const nuevoUsuario = usuarioRepository.crear({
        nombre: nombre.trim(),
        email: emailNormalizado,
        passwordHash,
        rol: 'usuario'
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
    const { email, password } = datosLogin;

    if (
        typeof email !== 'string' ||
        typeof password !== 'string'
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


module.exports = { registrar, login };
