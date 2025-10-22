import { Router } from "express";
import { PromocionController } from "../controller/PromocionController";
import { auth } from "../middleware/auth";
import { requirePromocionOwnerOrAdmin, requirePromocionOwnerOrAdminByBody } from "../middleware/authorize";

const router = Router();

// Crear una promo (solo restaurantes)
router.post("/", auth, requirePromocionOwnerOrAdminByBody(), PromocionController.create);

// Listar todas las promos activas
router.get("/", PromocionController.getAll);

// Listar promos por restaurante
router.get("/restaurante/:id", PromocionController.getByRestaurante);

// Actualizar promo
router.put("/:id", auth, requirePromocionOwnerOrAdmin(), PromocionController.update);

// Eliminar promo
router.delete("/:id", auth, requirePromocionOwnerOrAdmin(), PromocionController.remove);

export default router;
