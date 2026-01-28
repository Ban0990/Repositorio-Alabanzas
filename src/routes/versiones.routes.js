import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import {
  listarPorCancion,
  crearVersion,
  activarVersion,
} from "../controladores/versiones.controller.js";

const router = Router();

// Lista versiones de una canción (opcional filtro ?instrumento=guitarra)
router.get("/cancion/:cancionId", authMiddleware, listarPorCancion);

// Crear nueva versión
router.post("/", authMiddleware, crearVersion);

// Activar versión
router.put("/:id/activar", authMiddleware, activarVersion);

export default router;
