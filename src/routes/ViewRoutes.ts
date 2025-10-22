import { Router } from "express";
import { ViewController } from "../controller/ViewController";

const router = Router();

router.get("/promociones-activas", ViewController.promocionesActivas);
router.get("/rating-promedio", ViewController.ratingPromedio);

export default router;
