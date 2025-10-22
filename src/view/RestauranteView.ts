import { Restaurante } from "../model/Restaurante";
import { toUsuarioSummary } from "./UsuarioView";

export const toRestauranteSummary = (restaurante: Restaurante) => ({
    idRestaurante: restaurante.idRestaurante,
    nombreComercial: restaurante.nombreComercial,
});

export const toRestauranteView = (restaurante: Restaurante) => ({
    ...toRestauranteSummary(restaurante),
    direccion: restaurante.direccion ?? null,
    telefono: restaurante.telefono ?? null,
    ciudad: restaurante.ciudad ?? null,
    fotoPerfil: restaurante.fotoPerfil ?? null,
    usuario: restaurante.usuario ? toUsuarioSummary(restaurante.usuario) : null,
});
