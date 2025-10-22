import { SolicitudRestaurante } from "../model/SolicitudRestaurante";
import { toUsuarioSummary } from "./UsuarioView";

export const toSolicitudRestauranteView = (solicitud: SolicitudRestaurante) => ({
    idSolicitud: solicitud.idSolicitud,
    estado: solicitud.estado,
    nombreComercial: solicitud.nombreComercial,
    nit: solicitud.nit ?? null,
    telefono: solicitud.telefono ?? null,
    direccion: solicitud.direccion ?? null,
    ciudad: solicitud.ciudad ?? null,
    descripcion: solicitud.descripcion ?? null,
    fechaSolicitud: solicitud.fechaSolicitud,
    fechaActualizacion: solicitud.fechaActualizacion,
    fechaResolucion: solicitud.fechaResolucion ?? null,
    observaciones: solicitud.observaciones ?? null,
    usuario: solicitud.usuario ? toUsuarioSummary(solicitud.usuario) : null,
});
