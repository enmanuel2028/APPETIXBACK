import { Router } from "express";
import { LogController } from "../controller/LogController";
import { auth } from "../middleware/auth";

const router = Router();

router.get("/", auth, LogController.getAll);
router.get("/usuario/:id", auth, LogController.getByUsuario);
router.post("/", auth, LogController.create);
router.delete("/:id", auth, LogController.remove);

export default router;
