import { Usuario } from "../model/Usuarios";
import { toUsuarioView } from "./UsuarioView";

type Tokens = {
    access: string;
    refresh: string;
};

export const toAuthUser = (user: Usuario) => toUsuarioView(user);

export const buildAuthPayload = (user: Usuario, tokens: Tokens) => {
    const accessToken = tokens.access;
    const refreshToken = tokens.refresh;

    const wrapToken = (value: string) => ({
        token: value,
        value,
        raw: value,
    });

    return {
        user: toAuthUser(user),
        access: accessToken,
        refresh: refreshToken,
        accessToken,
        refreshToken,
        tokens: {
            access: wrapToken(accessToken),
            refresh: wrapToken(refreshToken),
            accessToken,
            refreshToken,
        },
    };
};
