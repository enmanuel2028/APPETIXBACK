import { Usuario } from "../model/Usuarios";
import { toUsuarioView } from "./UsuarioView";

type Tokens = {
    access: string;
    refresh: string;
};

export const toAuthUser = (user: Usuario) => toUsuarioView(user);

export const buildAuthPayload = (user: Usuario, tokens: Tokens) => ({
    user: toAuthUser(user),
    ...tokens,
});
