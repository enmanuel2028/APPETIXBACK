import { Router } from "express";
import { CalificacionController } from "../controller/CalificacionController";
import { auth } from "../middleware/auth";

const router = Router();

router.get("/", CalificacionController.getAll);
router.get("/restaurante/:id", CalificacionController.getByRestaurante);
router.get("/usuario/:id", CalificacionController.getByUsuario);
router.post("/", auth, CalificacionController.create);
router.put("/:id", auth, CalificacionController.update);
router.delete("/:id", auth, CalificacionController.remove);

export default router;
