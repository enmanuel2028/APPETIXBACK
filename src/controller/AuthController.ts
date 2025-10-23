import { Request, Response } from "express";
import { randomBytes } from "crypto";
import { ZodError } from "zod";
import { AppDataSource } from "../config/data";
import { Usuario } from "../model/Usuarios";
import { Sesion } from "../model/Sesion";
import { PasswordReset } from "../model/PasswordReset";
import { hashPassword, comparePassword } from "../utils/password";
import { signAccess, signRefresh, verifyRefresh } from "../utils/jwt";
import { buildAuthPayload } from "../view/AuthView";
import {
    loginSchema,
    logoutSchema,
    refreshSchema,
    registerSchema,
    forgotPasswordSchema,
    resetPasswordSchema,
} from "../utils/validators/auth";
import { EmailService } from "../service/EmailService";

const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 30;
const RESET_TOKEN_TTL_MS = 1000 * 60 * 30;

export class AuthController {
    private static sendValidationError(res: Response, error: ZodError) {
        return res.status(400).json({
            message: "Datos inválidos",
            errors: error.flatten().fieldErrors,
        });
    }

    private static async issueTokens(user: Usuario) {
        const access = signAccess({ sub: user.idUsuario, role: user.rol });
        const refresh = signRefresh({ sub: user.idUsuario, role: user.rol });

        const sesionRepo = AppDataSource.getRepository(Sesion);
        await sesionRepo.save({
            usuario: user,
            token: refresh,
            fechaExpira: new Date(Date.now() + SESSION_TTL_MS),
        });

        return { access, refresh };
    }

    static async register(req: Request, res: Response) {
        try {
            const parsed = registerSchema.safeParse(req.body);
            if (!parsed.success) {
                return AuthController.sendValidationError(res, parsed.error);
            }

            const { nombre, email, password } = parsed.data;
            const userRepo = AppDataSource.getRepository(Usuario);

            const exists = await userRepo.findOne({ where: { email } });
            if (exists) {
                return res.status(400).json({ message: "El email ya esta registrado" });
            }

            const hashed = await hashPassword(password);
            const nuevo = userRepo.create({
                nombre,
                email,
                password: hashed,
                rol: "cliente",
                estado: 1,
            });

            await userRepo.save(nuevo);
            const tokens = await AuthController.issueTokens(nuevo);

            return res.status(201).json(buildAuthPayload(nuevo, tokens));
        } catch (err) {
            console.error(err);
            return res.status(500).json({ message: "Error en el registro" });
        }
    }

    static async login(req: Request, res: Response) {
        try {
            const parsed = loginSchema.safeParse(req.body);
            if (!parsed.success) {
                return AuthController.sendValidationError(res, parsed.error);
            }

            const { email, password } = parsed.data;
            const userRepo = AppDataSource.getRepository(Usuario);

            const user = await userRepo.findOne({ where: { email } });
            if (!user || user.estado !== 1) {
                return res.status(401).json({ message: "Credenciales inválidas" });
            }

            const valid = await comparePassword(password, user.password);
            if (!valid) {
                return res.status(401).json({ message: "Credenciales inválidas" });
            }

            const tokens = await AuthController.issueTokens(user);
            return res.json(buildAuthPayload(user, tokens));
        } catch (err) {
            console.error(err);
            return res.status(500).json({ message: "Error en el login" });
        }
    }

    static async forgotPassword(req: Request, res: Response) {
        try {
            const parsed = forgotPasswordSchema.safeParse(req.body);
            if (!parsed.success) {
                return AuthController.sendValidationError(res, parsed.error);
            }

            const { email } = parsed.data;
            const userRepo = AppDataSource.getRepository(Usuario);
            const user = await userRepo.findOne({ where: { email } });

            if (!user || user.estado !== 1) {
                return res.json({
                    success: true,
                    message: "Si el correo esta registrado enviaremos instrucciones de recuperacion",
                });
            }

            const resetRepo = AppDataSource.getRepository(PasswordReset);

            await resetRepo
                .createQueryBuilder()
                .delete()
                .where("idUsuario = :idUsuario", { idUsuario: user.idUsuario })
                .execute();

            const token = randomBytes(32).toString("hex");
            const reset = resetRepo.create({
                usuario: user,
                token,
                fechaExpira: new Date(Date.now() + RESET_TOKEN_TTL_MS),
                usado: false,
            });
            await resetRepo.save(reset);

            const baseUrl = process.env.RESET_PASSWORD_URL || "http://localhost:3000/reset-password";
            const resetLink = `${baseUrl}?token=${token}`;

            try {
                await EmailService.sendPasswordReset(user.email, resetLink);
            } catch (error_) {
                console.error(error_);
                return res
                    .status(500)
                    .json({ message: "No se pudo enviar el correo de recuperacion, intente mas tarde" });
            }

            return res.json({
                success: true,
                message: "Si el correo esta registrado enviaremos instrucciones de recuperacion",
            });
        } catch (err) {
            console.error(err);
            return res.status(500).json({ message: "Error al solicitar recuperacion de contrasena" });
        }
    }

    static async refresh(req: Request, res: Response) {
        try {
            const parsed = refreshSchema.safeParse(req.body);
            if (!parsed.success) {
                return AuthController.sendValidationError(res, parsed.error);
            }

            const { refreshToken } = parsed.data;
            const sesionRepo = AppDataSource.getRepository(Sesion);
            const session = await sesionRepo.findOne({ where: { token: refreshToken } });

            if (!session) {
                return res.status(401).json({ message: "Refresh inválido" });
            }

            let payload: any;
            try {
                payload = verifyRefresh(refreshToken);
            } catch (error_) {
                await sesionRepo.remove(session);
                console.error(error_);
                return res.status(401).json({ message: "Refresh inválido" });
            }

            const userRepo = AppDataSource.getRepository(Usuario);
            const user = await userRepo.findOneBy({ idUsuario: Number(payload.sub) });

            if (!user || user.estado !== 1) {
                await sesionRepo.remove(session);
                return res.status(401).json({ message: "Usuario no autorizado" });
            }

            await sesionRepo.remove(session);
            const tokens = await AuthController.issueTokens(user);

            return res.json(buildAuthPayload(user, tokens));
        } catch (err) {
            console.error(err);
            return res.status(500).json({ message: "Error al refrescar token" });
        }
    }

    static async resetPassword(req: Request, res: Response) {
        try {
            const parsed = resetPasswordSchema.safeParse(req.body);
            if (!parsed.success) {
                return AuthController.sendValidationError(res, parsed.error);
            }

            const { token, password } = parsed.data;
            const resetRepo = AppDataSource.getRepository(PasswordReset);
            const reset = await resetRepo.findOne({
                where: { token },
                relations: ["usuario"],
            });

            if (!reset || !reset.usuario) {
                return res.status(400).json({ message: "Token invalido" });
            }

            if (reset.usado) {
                return res.status(400).json({ message: "Token ya fue utilizado" });
            }

            if (reset.fechaExpira.getTime() < Date.now()) {
                reset.usado = true;
                await resetRepo.save(reset);
                return res.status(400).json({ message: "Token expirado" });
            }

            const user = reset.usuario;
            if (user.estado !== 1) {
                return res.status(400).json({ message: "Usuario no habilitado" });
            }

            user.password = await hashPassword(password);
            await AppDataSource.getRepository(Usuario).save(user);

            reset.usado = true;
            await resetRepo.save(reset);

            await AppDataSource.getRepository(Sesion)
                .createQueryBuilder()
                .delete()
                .where("idUsuario = :idUsuario", { idUsuario: user.idUsuario })
                .execute();

            return res.json({ success: true, message: "Contrasena actualizada correctamente" });
        } catch (err) {
            console.error(err);
            return res.status(500).json({ message: "Error al restablecer la contrasena" });
        }
    }

    static async logout(req: Request, res: Response) {
        try {
            const parsed = logoutSchema.safeParse(req.body);
            if (!parsed.success) {
                return AuthController.sendValidationError(res, parsed.error);
            }

            const { refreshToken } = parsed.data;
            const sesionRepo = AppDataSource.getRepository(Sesion);
            const session = await sesionRepo.findOne({ where: { token: refreshToken } });

            if (session) {
                await sesionRepo.remove(session);
            }

            return res.json({ success: true, message: "Sesion cerrada" });
        } catch (err) {
            console.error(err);
            return res.status(500).json({ message: "Error en logout" });
        }
    }
}


