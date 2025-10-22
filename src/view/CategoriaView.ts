import { Categoria } from "../model/Categoria";

export const toCategoriaView = (categoria: Categoria) => ({
    idCategoria: categoria.idCategoria,
    nombre: categoria.nombre,
});
