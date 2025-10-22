import { Router } from "express";
import { UsuarioController } from "../controller/UsuarioController";
import { auth } from "../middleware/auth";
import { requireRole } from "../middleware/authorize";

const router = Router();

router.get("/", auth, UsuarioController.getAll);
router.get("/:id", auth, UsuarioController.getById);
router.post("/", auth, requireRole("admin"), UsuarioController.create);
router.put("/:id", auth, UsuarioController.update);
router.patch("/:id/disable", auth, requireRole("admin"), UsuarioController.disable);

export default router;
