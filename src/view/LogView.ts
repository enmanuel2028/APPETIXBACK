import { Log } from "../model/Log";
import { toUsuarioSummary } from "./UsuarioView";

export const toLogView = (log: Log) => ({
    idLog: log.idLog,
    usuario: log.usuario ? toUsuarioSummary(log.usuario) : null,
    accion: log.accion,
    fecha: log.fecha,
});
