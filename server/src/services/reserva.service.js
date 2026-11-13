const reservaRepository = require("../repositories/reserva.repository");
const viviendaRepository = require("../repositories/vivienda.repository");
const usuarioRepository = require("../repositories/usuario.repository");
const fechaValida = (fecha) =>
  typeof fecha === "string" &&
  /^\d{4}-\d{2}-\d{2}$/.test(fecha) &&
  Number.isFinite(Date.parse(fecha)) &&
  new Date(fecha).toISOString().slice(0, 10) === fecha;
const validar = (datos, id = null) => {
  const { viviendaId, usuarioId, fechaInicio, fechaFin, estado } = datos || {};
  if (
    !Number.isSafeInteger(viviendaId) ||
    viviendaId <= 0 ||
    !Number.isSafeInteger(usuarioId) ||
    usuarioId <= 0
  )
    throw new Error("Los identificadores no son válidos");
  if (!viviendaRepository.obtenerPorId(viviendaId))
    throw new Error("La vivienda no existe");
  if (!usuarioRepository.buscarPorId(usuarioId))
    throw new Error("El usuario no existe");
  if (
    !fechaValida(fechaInicio) ||
    !fechaValida(fechaFin) ||
    fechaInicio >= fechaFin
  )
    throw new Error(
      "Las fechas no son válidas: el fin debe ser posterior al inicio",
    );
  if (!["pendiente", "confirmada", "cancelada"].includes(estado))
    throw new Error("Estado no válido");
  // El día de salida puede coincidir con la entrada de otra reserva.
  if (
    estado !== "cancelada" &&
    reservaRepository
      .obtenerTodas()
      .some(
        (r) =>
          r.id !== id &&
          r.viviendaId === viviendaId &&
          r.estado !== "cancelada" &&
          fechaInicio < r.fechaFin &&
          fechaFin > r.fechaInicio,
      )
  )
    throw new Error("La vivienda ya está reservada durante esas fechas");
  return { viviendaId, usuarioId, fechaInicio, fechaFin, estado };
};
const obtenerTodas = () => reservaRepository.obtenerTodas();
const obtenerPorId = (id) => reservaRepository.obtenerPorId(id);
const crear = (datos) =>
  reservaRepository.crear(validar({ ...datos, estado: "pendiente" }));
const actualizar = (id, datos) => {
  if (!reservaRepository.obtenerPorId(id)) return null;
  return reservaRepository.actualizar(id, validar(datos, id));
};
const eliminar = (id) => reservaRepository.eliminar(id);
module.exports = { obtenerTodas, obtenerPorId, crear, actualizar, eliminar };
