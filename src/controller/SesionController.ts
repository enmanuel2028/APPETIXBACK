import { Request, Response } from "express";
import { SesionService } from "../service/SesionService";
import { handleControllerError } from "../utils/controllerError";
import { toSesionView } from "../view/SesionView";

const sesionService = SesionService.getInstance();

export class SesionController {
    static async create(req: Request, res: Response) {
        try {
            const sesion = await sesionService.createSesion(req.body);
            return res.status(201).json(toSesionView(sesion));
        } catch (err) {
            return handleControllerError(res, err, "Error al crear sesion");
        }
    }

    static async getAll(_req: Request, res: Response) {
        try {
            const sesiones = await sesionService.list();
            return res.json(sesiones.map(toSesionView));
        } catch (err) {
            return handleControllerError(res, err, "Error al listar sesiones");
        }
    }

    static async getById(req: Request, res: Response) {
        try {
            const sesion = await sesionService.get(Number(req.params.id));
            return res.json(toSesionView(sesion));
        } catch (err) {
            return handleControllerError(res, err, "Error al obtener sesion");
        }
    }

    static async getByUsuario(req: Request, res: Response) {
        try {
            const sesiones = await sesionService.listByUsuario(Number(req.params.id));
            return res.json(sesiones.map(toSesionView));
        } catch (err) {
            return handleControllerError(res, err, "Error al listar sesiones");
        }
    }

    static async remove(req: Request, res: Response) {
        try {
            await sesionService.deleteSesion(Number(req.params.id));
            return res.json({ success: true });
        } catch (err) {
            return handleControllerError(res, err, "Error al eliminar sesion");
        }
    }

    static async removeByUsuario(req: Request, res: Response) {
        try {
            await sesionService.deleteByUsuario(Number(req.params.id));
            return res.json({ success: true });
        } catch (err) {
            return handleControllerError(res, err, "Error al eliminar sesiones del usuario");
        }
    }
}
