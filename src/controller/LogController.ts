import { Request, Response } from "express";
import { LogService } from "../service/LogService";
import { handleControllerError } from "../utils/controllerError";
import { toLogView } from "../view/LogView";

const logService = LogService.getInstance();

export class LogController {
    static async create(req: Request, res: Response) {
        try {
            const log = await logService.createLog(req.body);
            return res.status(201).json(toLogView(log));
        } catch (err) {
            return handleControllerError(res, err, "Error al crear log");
        }
    }

    static async getAll(_req: Request, res: Response) {
        try {
            const logs = await logService.list();
            return res.json(logs.map(toLogView));
        } catch (err) {
            return handleControllerError(res, err, "Error al listar logs");
        }
    }

    static async getByUsuario(req: Request, res: Response) {
        try {
            const logs = await logService.listByUsuario(Number(req.params.id));
            return res.json(logs.map(toLogView));
        } catch (err) {
            return handleControllerError(res, err, "Error al listar logs del usuario");
        }
    }

    static async remove(req: Request, res: Response) {
        try {
            await logService.deleteLog(Number(req.params.id));
            return res.json({ success: true });
        } catch (err) {
            return handleControllerError(res, err, "Error al eliminar log");
        }
    }
}
