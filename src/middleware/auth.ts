import { Request, Response, NextFunction } from "express";
import { verifyAccess } from "../utils/jwt";

export function auth(req: Request, res: Response, next: NextFunction) {
    try {
        const header = req.headers["authorization"];
        if (!header) return res.status(401).json({ message: "No token provided" });

        const token = header.startsWith("Bearer ") ? header.slice(7) : header;
        const payload = verifyAccess(token);

        // guardamos los datos del usuario en el request
        (req as any).user = payload;

        next();
    } catch (err) {
        console.error(err);
        return res.status(401).json({ message: "Token inválido o expirado" });
    }
}
