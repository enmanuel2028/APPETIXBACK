import { Request, Response } from "express";
import { CalificacionService } from "../service/CalificacionService";
import { handleControllerError } from "../utils/controllerError";
import { toCalificacionView } from "../view/CalificacionView";

const calificacionService = CalificacionService.getInstance();

export class CalificacionController {
    static async create(req: Request, res: Response) {
        try {
            const calificacion = await calificacionService.createCalificacion(req.body);
            return res.status(201).json(toCalificacionView(calificacion));
        } catch (err) {
            return handleControllerError(res, err, "Error al crear calificacion");
        }
    }

    static async getAll(_req: Request, res: Response) {
        try {
            const calificaciones = await calificacionService.list();
            return res.json(calificaciones.map(toCalificacionView));
        } catch (err) {
            return handleControllerError(res, err, "Error al listar calificaciones");
        }
    }

    static async getByRestaurante(req: Request, res: Response) {
        try {
            const calificaciones = await calificacionService.listByRestaurante(Number(req.params.id));
            return res.json(calificaciones.map(toCalificacionView));
        } catch (err) {
            return handleControllerError(res, err, "Error al listar calificaciones");
        }
    }

    static async getByUsuario(req: Request, res: Response) {
        try {
            const calificaciones = await calificacionService.listByUsuario(Number(req.params.id));
            return res.json(calificaciones.map(toCalificacionView));
        } catch (err) {
            return handleControllerError(res, err, "Error al listar calificaciones");
        }
    }

    static async update(req: Request, res: Response) {
        try {
            const calificacion = await calificacionService.updateCalificacion(
                Number(req.params.id),
                req.body,
            );
            return res.json(toCalificacionView(calificacion));
        } catch (err) {
            return handleControllerError(res, err, "Error al actualizar calificacion");
        }
    }

    static async remove(req: Request, res: Response) {
        try {
            await calificacionService.deleteCalificacion(Number(req.params.id));
            return res.json({ success: true });
        } catch (err) {
            return handleControllerError(res, err, "Error al eliminar calificacion");
        }
    }
}
