import { Request, Response } from "express";
import { PromocionService } from "../service/PromocionService";
import { handleControllerError } from "../utils/controllerError";
import { toPromocionDetailView, toPromocionView } from "../view/PromocionesView";
import { createPromocionSchema, updatePromocionSchema } from "../utils/validators/promocion";
import { extractFieldErrors } from "../utils/zodError";
import { publicPromocionFotoPath } from "../middleware/uploadPromocion";

const promocionService = PromocionService.getInstance();

export class PromocionController {
    static async create(req: Request, res: Response) {
        try {
            const parsed = createPromocionSchema.safeParse(req.body);
            if (!parsed.success) {
                return res.status(400).json({
                    message: "Datos inválidos",
                    errors: extractFieldErrors(parsed.error),
                });
            }

            const promocion = await promocionService.createPromocion(parsed.data);
            return res.status(201).json(toPromocionDetailView(promocion));
        } catch (err) {
            return handleControllerError(res, err, "Error al crear promocion");
        }
    }

    static async getAll(req: Request, res: Response) {
        try {
            const pageParam = req.query.page as string | undefined;
            const limitParam = req.query.limit as string | undefined;

            if (pageParam || limitParam) {
                const page = Math.max(1, parseInt(pageParam || "1", 10));
                const rawLimit = parseInt(limitParam || "10", 10);
                const limit = Math.min(Math.max(1, isNaN(rawLimit) ? 10 : rawLimit), 100);
                const { items, total } = await promocionService.listActivasPaged(page, limit);
                const totalPages = Math.max(1, Math.ceil(total / limit));
                res.setHeader("X-Total-Count", String(total));
                res.setHeader("X-Total-Pages", String(totalPages));
                res.setHeader("X-Page", String(page));
                res.setHeader("X-Limit", String(limit));
                return res.json(items.map(toPromocionView));
            }

            const promociones = await promocionService.listActivas();
            return res.json(promociones.map(toPromocionView));
        } catch (err) {
            return handleControllerError(res, err, "Error al listar promociones");
        }
    }

    static async getByRestaurante(req: Request, res: Response) {
        try {
            const id = Number(req.params.id);
            const pageParam = req.query.page as string | undefined;
            const limitParam = req.query.limit as string | undefined;

            if (pageParam || limitParam) {
                const page = Math.max(1, parseInt(pageParam || "1", 10));
                const rawLimit = parseInt(limitParam || "10", 10);
                const limit = Math.min(Math.max(1, isNaN(rawLimit) ? 10 : rawLimit), 100);
                const { items, total } = await promocionService.listByRestaurantePaged(id, page, limit);
                const totalPages = Math.max(1, Math.ceil(total / limit));
                res.setHeader("X-Total-Count", String(total));
                res.setHeader("X-Total-Pages", String(totalPages));
                res.setHeader("X-Page", String(page));
                res.setHeader("X-Limit", String(limit));
                return res.json(items.map(toPromocionView));
            }

            const promociones = await promocionService.listByRestaurante(id);
            return res.json(promociones.map(toPromocionView));
        } catch (err) {
            return handleControllerError(res, err, "Error al listar promociones del restaurante");
        }
    }

    static async update(req: Request, res: Response) {
        try {
            const parsed = updatePromocionSchema.safeParse(req.body);
            if (!parsed.success) {
                return res.status(400).json({
                    message: "Datos inválidos",
                    errors: extractFieldErrors(parsed.error),
                });
            }

            const promocion = await promocionService.updatePromocion(Number(req.params.id), parsed.data);
            return res.json(toPromocionDetailView(promocion));
        } catch (err) {
            return handleControllerError(res, err, "Error al actualizar promocion");
        }
    }

    static async remove(req: Request, res: Response) {
        try {
            await promocionService.deletePromocion(Number(req.params.id));
            return res.json({ success: true });
        } catch (err) {
            return handleControllerError(res, err, "Error al eliminar promocion");
        }
    }

    static async uploadFoto(req: Request, res: Response) {
        try {
            const id = Number(req.params.id);
            // req.file is set by multer middleware
            const file = (req as any).file as Express.Multer.File | undefined;
            if (!file) {
                return res.status(400).json({ message: "Archivo 'foto' requerido" });
            }
            const imagenUrl = publicPromocionFotoPath(file.filename);
            const promocion = await promocionService.updatePromocion(id, { imagenUrl });
            return res.status(200).json(toPromocionDetailView(promocion));
        } catch (err) {
            return handleControllerError(res, err, "Error al subir foto de promoción");
        }
    }
}
