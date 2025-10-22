import { Sesion } from "../model/Sesion";
import { toUsuarioSummary } from "./UsuarioView";

export const toSesionView = (sesion: Sesion) => ({
    idSesion: sesion.idSesion,
    usuario: sesion.usuario ? toUsuarioSummary(sesion.usuario) : null,
    token: sesion.token,
    fechaInicio: sesion.fechaInicio,
    fechaExpira: sesion.fechaExpira ?? null,
});
