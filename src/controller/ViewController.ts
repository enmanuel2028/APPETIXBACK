import { Request, Response } from "express";
import { ViewService } from "../service/ViewService";
import { handleControllerError } from "../utils/controllerError";

const viewService = ViewService.getInstance();

export class ViewController {
    static async promocionesActivas(_req: Request, res: Response) {
        try {
            const data = await viewService.getPromocionesActivas();
            return res.json(data);
        } catch (err) {
            return handleControllerError(res, err, "Error al consultar vista de promociones activas");
        }
    }

    static async ratingPromedio(_req: Request, res: Response) {
        try {
            const data = await viewService.getRatingPromedio();
            return res.json(data);
        } catch (err) {
            return handleControllerError(res, err, "Error al consultar vista de rating promedio");
        }
    }
}
