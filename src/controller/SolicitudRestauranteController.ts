import { Request, Response } from "express";
import { SolicitudRestauranteService } from "../service/SolicitudRestauranteService";
import { handleControllerError } from "../utils/controllerError";
import {
    solicitudRestauranteSchema,
    resolverSolicitudSchema,
    estadoSolicitudSchema,
    actualizarSolicitudSchema,
} from "../utils/validators/solicitudRestaurante";
import { toSolicitudRestauranteView } from "../view/SolicitudRestauranteView";

const solicitudService = SolicitudRestauranteService.getInstance();

export class SolicitudRestauranteController {
    static async create(req: Request, res: Response) {
        try {
            const authUser = (req as any).user;
            if (!authUser) {
                return res.status(401).json({ message: "No autenticado" });
            }

            const parsed = solicitudRestauranteSchema.safeParse(req.body);
            if (!parsed.success) {
                return res.status(400).json({
                    message: "Datos inválidos",
                    errors: parsed.error.flatten().fieldErrors,
                });
            }

            const solicitud = await solicitudService.createSolicitud(
                Number(authUser.sub),
                parsed.data,
            );

            return res.status(201).json(toSolicitudRestauranteView(solicitud));
        } catch (err) {
            return handleControllerError(res, err, "Error al solicitar registro como restaurante");
        }
    }

    static async list(req: Request, res: Response) {
        try {
            const parsed = estadoSolicitudSchema.safeParse(req.query);
            const solicitudes = await solicitudService.list(parsed.success ? parsed.data.estado : undefined);

            return res.json(solicitudes.map(toSolicitudRestauranteView));
        } catch (err) {
            return handleControllerError(res, err, "Error al listar solicitudes");
        }
    }

    static async getById(req: Request, res: Response) {
        try {
            const solicitud = await solicitudService.getById(Number(req.params.id));
            return res.json(toSolicitudRestauranteView(solicitud));
        } catch (err) {
            return handleControllerError(res, err, "Error al obtener solicitud");
        }
    }

    static async getMine(req: Request, res: Response) {
        try {
            const authUser = (req as any).user;
            if (!authUser) {
                return res.status(401).json({ message: "No autenticado" });
            }

            const solicitud = await solicitudService.getByUsuario(Number(authUser.sub));
            if (!solicitud) {
                return res.json(null);
            }

            return res.json(toSolicitudRestauranteView(solicitud));
        } catch (err) {
            return handleControllerError(res, err, "Error al obtener la solicitud");
        }
    }

    static async approve(req: Request, res: Response) {
        try {
            const parsed = resolverSolicitudSchema.safeParse(req.body);
            if (!parsed.success) {
                return res.status(400).json({
                    message: "Datos inválidos",
                    errors: parsed.error.flatten().fieldErrors,
                });
            }

            const solicitud = await solicitudService.approveSolicitud(
                Number(req.params.id),
                parsed.data,
            );

            return res.json(toSolicitudRestauranteView(solicitud));
        } catch (err) {
            return handleControllerError(res, err, "Error al aprobar solicitud");
        }
    }

    static async reject(req: Request, res: Response) {
        try {
            const parsed = resolverSolicitudSchema.safeParse(req.body);
            if (!parsed.success) {
                return res.status(400).json({
                    message: "Datos inválidos",
                    errors: parsed.error.flatten().fieldErrors,
                });
            }

            const solicitud = await solicitudService.rejectSolicitud(
                Number(req.params.id),
                parsed.data,
            );

            return res.json(toSolicitudRestauranteView(solicitud));
        } catch (err) {
            return handleControllerError(res, err, "Error al rechazar solicitud");
        }
    }

    // PUT /api/solicitudes-restaurante/:id
    // Permite resolver una solicitud enviando { estado: "aprobado" | "rechazado", observaciones? }
    static async update(req: Request, res: Response) {
        try {
            const parsed = actualizarSolicitudSchema.safeParse(req.body);
            if (!parsed.success) {
                return res.status(400).json({
                    message: "Datos inválidos",
                    errors: parsed.error.flatten().fieldErrors,
                });
            }

            const { estado, observaciones } = parsed.data;
            const id = Number(req.params.id);

            const solicitud =
                estado === "aprobado"
                    ? await solicitudService.approveSolicitud(id, { observaciones })
                    : await solicitudService.rejectSolicitud(id, { observaciones });

            return res.json(toSolicitudRestauranteView(solicitud));
        } catch (err) {
            return handleControllerError(res, err, "Error al actualizar solicitud");
        }
    }
}
