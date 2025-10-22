import { Router } from "express";
import authRoutes from "./AuthRoutes";
import promocionRoutes from "./PromocionRoutes";
import usuarioRoutes from "./UsuarioRoutes";
import restauranteRoutes from "./RestauranteRoutes";
import categoriaRoutes from "./CategoriaRoutes";
import calificacionRoutes from "./CalificacionRoutes";
import sesionRoutes from "./SesionRoutes";
import logRoutes from "./LogRoutes";
import viewRoutes from "./ViewRoutes";
import solicitudRestauranteRoutes from "./SolicitudRestauranteRoutes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/usuarios", usuarioRoutes);
router.use("/restaurantes", restauranteRoutes);
router.use("/categorias", categoriaRoutes);
router.use("/promociones", promocionRoutes);
router.use("/calificaciones", calificacionRoutes);
router.use("/sesiones", sesionRoutes);
router.use("/logs", logRoutes);
router.use("/vistas", viewRoutes);
router.use("/solicitudes-restaurante", solicitudRestauranteRoutes);

export default router;
