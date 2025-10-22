import { Router } from "express";
import { CategoriaController } from "../controller/CategoriaController";
import { auth } from "../middleware/auth";

const router = Router();

router.get("/", CategoriaController.getAll);
router.post("/", auth, CategoriaController.create);
router.put("/:id", auth, CategoriaController.update);
router.delete("/:id", auth, CategoriaController.remove);

export default router;
