import { Router } from "express";
import { SesionController } from "../controller/SesionController";
import { auth } from "../middleware/auth";

const router = Router();

router.get("/", auth, SesionController.getAll);
router.get("/usuario/:id", auth, SesionController.getByUsuario);
router.get("/:id", auth, SesionController.getById);
router.post("/", auth, SesionController.create);
router.delete("/usuario/:id", auth, SesionController.removeByUsuario);
router.delete("/:id", auth, SesionController.remove);

export default router;
