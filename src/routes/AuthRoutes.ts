import { Router } from "express";
import { AuthController } from "../controller/AuthController";

const router = Router();

// Registro de usuario
router.post("/register", AuthController.register);

// Login de usuario
router.post("/login", AuthController.login);

// Refrescar token
router.post("/refresh", AuthController.refresh);

// Logout (revoca refresh token en SESIONES)
router.post("/logout", AuthController.logout);

export default router;
