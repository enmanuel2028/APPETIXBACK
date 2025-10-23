import { Router } from "express";
import { AuthController } from "../controller/AuthController";

const router = Router();

// Registro de usuario
router.post("/register", AuthController.register);

// Login de usuario
router.post("/login", AuthController.login);

// Solicitar recuperacion de contrasena
router.post("/forgot-password", AuthController.forgotPassword);

// Restablecer contrasena con token
router.post("/reset-password", AuthController.resetPassword);

// Refrescar token
router.post("/refresh", AuthController.refresh);

// Logout (revoca refresh token en SESIONES)
router.post("/logout", AuthController.logout);

export default router;
