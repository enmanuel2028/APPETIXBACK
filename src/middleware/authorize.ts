import { Request, Response, NextFunction } from "express";
import { AppDataSource } from "../config/data";
import { Restaurante } from "../model/Restaurante";
import { Promocion } from "../model/Promocion";

type Role = "cliente" | "restaurante" | "admin";

export function requireRole(...roles: Role[]) {
    return (req: Request, res: Response, next: NextFunction) => {
        const user = (req as any).user;

        if (!user || !roles.includes(user.role)) {
            return res.status(403).json({ message: "Acceso no autorizado" });
        }

        return next();
    };
}

export function requireRestauranteOwnerOrAdmin() {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const user = (req as any).user as { sub: number; role: Role } | undefined;
            if (!user) return res.status(401).json({ message: "No autenticado" });

            if (user.role === "admin") return next();

            if (user.role !== "restaurante") {
                return res.status(403).json({ message: "Acceso no autorizado" });
            }

            const id = Number(req.params.id);
            if (!Number.isFinite(id)) {
                return res.status(400).json({ message: "id inválido" });
            }

            const repo = AppDataSource.getRepository(Restaurante);
            const restaurante = await repo.findOne({
                where: { idRestaurante: id },
                relations: ["usuario"],
            });

            if (!restaurante) {
                return res.status(404).json({ message: "Restaurante no encontrado" });
            }

            if (!restaurante.usuario || restaurante.usuario.idUsuario !== Number(user.sub)) {
                return res.status(403).json({ message: "Acceso no autorizado" });
            }

            return next();
        } catch (err) {
            console.error(err);
            return res.status(500).json({ message: "Error de autorización" });
        }
    };
}

// Verifica que el usuario autenticado sea dueño del restaurante indicado en el body (idRestaurante) o admin.
export function requirePromocionOwnerOrAdminByBody() {
    return async (req: Request, res: Response, next: NextFunction) => {
        const user = (req as any).user as { sub: number; role: Role } | undefined;
        if (!user) return res.status(401).json({ message: "No autenticado" });
        if (user.role === "admin") return next();
        if (user.role !== "restaurante") {
            return res.status(403).json({ message: "Acceso no autorizado" });
        }

        const idRestaurante = Number((req.body as any)?.idRestaurante);
        if (!Number.isFinite(idRestaurante)) {
            return res.status(400).json({ message: "idRestaurante inválido" });
        }

        const restRepo = AppDataSource.getRepository(Restaurante);
        const restaurante = await restRepo.findOne({
            where: { idRestaurante },
            relations: ["usuario"],
        });

        if (!restaurante) {
            return res.status(404).json({ message: "Restaurante no encontrado" });
        }

        if (!restaurante.usuario || restaurante.usuario.idUsuario !== Number(user.sub)) {
            return res.status(403).json({ message: "Acceso no autorizado" });
        }

        return next();
    };
}

// Verifica dueño de la promoción (por :id) o admin
export function requirePromocionOwnerOrAdmin() {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const user = (req as any).user as { sub: number; role: Role } | undefined;
            if (!user) return res.status(401).json({ message: "No autenticado" });
            if (user.role === "admin") return next();

            if (user.role !== "restaurante") {
                return res.status(403).json({ message: "Acceso no autorizado" });
            }

            const id = Number(req.params.id);
            if (!Number.isFinite(id)) {
                return res.status(400).json({ message: "id inválido" });
            }

            const promoRepo = AppDataSource.getRepository(Promocion);
            const promo = await promoRepo.findOne({
                where: { idPromocion: id },
                relations: ["restaurante", "restaurante.usuario"],
            });

            if (!promo) {
                return res.status(404).json({ message: "Promoción no encontrada" });
            }

            if (!promo.restaurante?.usuario || promo.restaurante.usuario.idUsuario !== Number(user.sub)) {
                return res.status(403).json({ message: "Acceso no autorizado" });
            }

            return next();
        } catch (err) {
            console.error(err);
            return res.status(500).json({ message: "Error de autorización" });
        }
    };
}
