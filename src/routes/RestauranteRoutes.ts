import { Router } from "express";
import { RestauranteController } from "../controller/RestauranteController";
import { auth } from "../middleware/auth";
import { requireRestauranteOwnerOrAdmin } from "../middleware/authorize";
import { uploadRestauranteFoto } from "../middleware/upload";

const router = Router();

router.get("/", RestauranteController.getAll);
router.get("/:id", RestauranteController.getById);
router.post("/", auth, RestauranteController.create);
router.put("/:id", auth, requireRestauranteOwnerOrAdmin(), RestauranteController.update);
router.post(
    "/:id/foto",
    auth,
    requireRestauranteOwnerOrAdmin(),
    uploadRestauranteFoto,
    RestauranteController.uploadFoto,
);
router.delete("/:id", auth, requireRestauranteOwnerOrAdmin(), RestauranteController.remove);

export default router;
