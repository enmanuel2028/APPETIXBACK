import { Usuario } from "../model/Usuarios";

export const toUsuarioView = (usuario: Usuario) => ({
    idUsuario: usuario.idUsuario,
    nombre: usuario.nombre,
    email: usuario.email,
    rol: usuario.rol,
    fechaRegistro: usuario.fechaRegistro,
    estado: usuario.estado,
});

export const toUsuarioSummary = (usuario: Usuario) => ({
    idUsuario: usuario.idUsuario,
    nombre: usuario.nombre,
    email: usuario.email,
    rol: usuario.rol,
});
