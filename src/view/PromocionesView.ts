import { Promocion } from "../model/Promocion";
import { toRestauranteView, toRestauranteSummary } from "./RestauranteView";
import { toCategoriaView } from "./CategoriaView";

export const toPromocionView = (promocion: Promocion) => ({
    idPromocion: promocion.idPromocion,
    restaurante: promocion.restaurante ? toRestauranteSummary(promocion.restaurante) : null,
    categoria: promocion.categoria ? toCategoriaView(promocion.categoria) : null,
    titulo: promocion.titulo,
    descripcion: promocion.descripcion,
    precio: Number(promocion.precio),
    imagenUrl: promocion.imagenUrl ?? null,
    fechaInicio: promocion.fechaInicio,
    fechaFin: promocion.fechaFin,
    estado: promocion.estado,
});

export const toPromocionDetailView = (promocion: Promocion) => ({
    ...toPromocionView(promocion),
    restaurante: promocion.restaurante ? toRestauranteView(promocion.restaurante) : null,
});
