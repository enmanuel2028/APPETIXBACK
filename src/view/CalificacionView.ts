import { Calificacion } from "../model/Calificacion";
import { toUsuarioSummary } from "./UsuarioView";
import { toRestauranteSummary } from "./RestauranteView";

export const toCalificacionView = (calificacion: Calificacion) => ({
    idCalificacion: calificacion.idCalificacion,
    usuario: calificacion.usuario ? toUsuarioSummary(calificacion.usuario) : null,
    restaurante: calificacion.restaurante ? toRestauranteSummary(calificacion.restaurante) : null,
    puntuacion: calificacion.puntuacion,
    comentario: calificacion.comentario ?? null,
    fecha: calificacion.fecha,
});
