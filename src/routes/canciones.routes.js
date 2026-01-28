import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import {
  listarCanciones,
  obtenerCancion,
  crearCancion,
  actualizarCancion,
} from "../controladores/canciones.controller.js";

const router = Router();

router.get("/", authMiddleware, listarCanciones);
router.get("/:id", authMiddleware, obtenerCancion);
router.post("/", authMiddleware, crearCancion);
router.put("/:id", authMiddleware, actualizarCancion);

export default router;
