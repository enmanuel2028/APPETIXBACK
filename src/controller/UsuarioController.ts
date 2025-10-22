import { Request, Response } from "express";
import { UsuarioService } from "../service/UsuarioService";
import { handleControllerError } from "../utils/controllerError";

const usuarioService = UsuarioService.getInstance();

export class UsuarioController {
    static async create(req: Request, res: Response) {
        try {
            const usuario = await usuarioService.createUser(req.body);
            return res.status(201).json(usuario);
        } catch (err) {
            return handleControllerError(res, err, "Error al crear usuario");
        }
    }

    static async getAll(_req: Request, res: Response) {
        try {
            const usuarios = await usuarioService.list();
            return res.json(usuarios);
        } catch (err) {
            return handleControllerError(res, err, "Error al listar usuarios");
        }
    }

    static async getById(req: Request, res: Response) {
        try {
            const usuario = await usuarioService.get(Number(req.params.id));
            return res.json(usuario);
        } catch (err) {
            return handleControllerError(res, err, "Error al obtener usuario");
        }
    }

    static async update(req: Request, res: Response) {
        try {
            const authUser = (req as any).user;
            const targetId = Number(req.params.id);

            if (!authUser) {
                return res.status(401).json({ message: "No autenticado" });
            }

            if (authUser.role !== "admin" && authUser.sub !== targetId) {
                return res.status(403).json({ message: "No autorizado para actualizar este usuario" });
            }

            const body = req.body ?? {};
            const { rol, ...rest } = body;

            if (rol !== undefined && authUser.role !== "admin") {
                return res.status(403).json({ message: "Solo un admin puede cambiar el rol" });
            }

            const payload = authUser.role === "admin" ? body : rest;

            const usuario = await usuarioService.updateUser(targetId, payload);
            return res.json(usuario);
        } catch (err) {
            return handleControllerError(res, err, "Error al actualizar usuario");
        }
    }

    static async disable(req: Request, res: Response) {
        try {
            await usuarioService.disableUser(Number(req.params.id));
            return res.json({ success: true });
        } catch (err) {
            return handleControllerError(res, err, "Error al desactivar usuario");
        }
    }
}
