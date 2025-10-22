import { Request, Response } from "express";
import { RestauranteService } from "../service/RestauranteService";
import { handleControllerError } from "../utils/controllerError";
import { toRestauranteView } from "../view/RestauranteView";
import { publicFotoPath } from "../middleware/upload";
import { createRestauranteSchema, updateRestauranteSchema } from "../utils/validators/restaurante";

const restauranteService = RestauranteService.getInstance();

export class RestauranteController {
    static async create(req: Request, res: Response) {
        try {
            const parsed = createRestauranteSchema.safeParse(req.body);
            if (!parsed.success) {
                return res.status(400).json({
                    message: "Datos inválidos",
                    errors: parsed.error.flatten().fieldErrors,
                });
            }
            const authUser = (req as any).user as { sub: number; role: "cliente" | "restaurante" | "admin" } | undefined;
            if (!authUser) {
                return res.status(401).json({ message: "No autenticado" });
            }

            if ("usuario" in parsed.data) {
                if (authUser.role !== "admin") {
                    return res.status(403).json({ message: "Solo un admin puede crear un usuario para el restaurante" });
                }
                const restaurante = await restauranteService.createRestauranteWithNewUser(parsed.data as any);
                return res.status(201).json(toRestauranteView(restaurante));
            }

            if ("idUsuario" in parsed.data) {
                const payload = parsed.data as any;
                if (authUser.role !== "admin" && payload.idUsuario !== Number(authUser.sub)) {
                    return res.status(403).json({ message: "No puede crear restaurantes para otro usuario" });
                }
                const restaurante = await restauranteService.createRestaurante(payload);
                return res.status(201).json(toRestauranteView(restaurante));
            }

            return res.status(400).json({ message: "Solicitud inválida" });
        } catch (err) {
            return handleControllerError(res, err, "Error al crear restaurante");
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
                const { items, total } = await restauranteService.listPaged(page, limit);
                const totalPages = Math.max(1, Math.ceil(total / limit));
                res.setHeader("X-Total-Count", String(total));
                res.setHeader("X-Total-Pages", String(totalPages));
                res.setHeader("X-Page", String(page));
                res.setHeader("X-Limit", String(limit));
                return res.json(items.map(toRestauranteView));
            }

            const restaurantes = await restauranteService.list();
            return res.json(restaurantes.map(toRestauranteView));
        } catch (err) {
            return handleControllerError(res, err, "Error al listar restaurantes");
        }
    }

    static async getById(req: Request, res: Response) {
        try {
            const restaurante = await restauranteService.get(Number(req.params.id));
            return res.json(toRestauranteView(restaurante));
        } catch (err) {
            return handleControllerError(res, err, "Error al obtener restaurante");
        }
    }

    static async update(req: Request, res: Response) {
        try {
            const parsed = updateRestauranteSchema.safeParse(req.body);
            if (!parsed.success) {
                return res.status(400).json({
                    message: "Datos inválidos",
                    errors: parsed.error.flatten().fieldErrors,
                });
            }
            const restaurante = await restauranteService.updateRestaurante(
                Number(req.params.id),
                parsed.data,
            );
            return res.json(toRestauranteView(restaurante));
        } catch (err) {
            return handleControllerError(res, err, "Error al actualizar restaurante");
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
            const fotoPerfil = publicFotoPath(file.filename);
            const restaurante = await restauranteService.updateRestaurante(id, { fotoPerfil });
            return res.status(200).json(toRestauranteView(restaurante));
        } catch (err) {
            return handleControllerError(res, err, "Error al subir foto de perfil");
        }
    }

    static async remove(req: Request, res: Response) {
        try {
            await restauranteService.deleteRestaurante(Number(req.params.id));
            return res.json({ success: true });
        } catch (err) {
            return handleControllerError(res, err, "Error al eliminar restaurante");
        }
    }
}
