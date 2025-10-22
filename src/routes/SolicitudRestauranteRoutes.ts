import { Router } from "express";
import { SolicitudRestauranteController } from "../controller/SolicitudRestauranteController";
import { auth } from "../middleware/auth";
import { requireRole } from "../middleware/authorize";

const router = Router();

router.post("/", auth, SolicitudRestauranteController.create);
router.get("/mine", auth, SolicitudRestauranteController.getMine);
router.get("/", auth, requireRole("admin"), SolicitudRestauranteController.list);
router.get("/:id", auth, requireRole("admin"), SolicitudRestauranteController.getById);
router.patch("/:id/aprobar", auth, requireRole("admin"), SolicitudRestauranteController.approve);
router.patch("/:id/rechazar", auth, requireRole("admin"), SolicitudRestauranteController.reject);
// Compatibilidad con front que usa PUT /:id para resolver (aprobar/rechazar)
router.put(
    "/:id",
    auth,
    requireRole("admin"),
    SolicitudRestauranteController.update,
);

export default router;
