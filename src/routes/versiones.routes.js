import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import {
  listarPorCancion,
  crearVersion,
  activarVersion,
  transponerVersion
} from "../controladores/versiones.controller.js";
import { requireSongEdit } from "../middlewares/song-permission.middleware.js";

const router = Router();

// Lista versiones de una canción (opcional filtro ?instrumento=guitarra)
router.get("/cancion/:cancionId", authMiddleware, listarPorCancion);
// Transponer acordes 
router.get("/:id/transponer", authMiddleware, transponerVersion);

// Crear nueva versión
router.post("/", authMiddleware, requireSongEdit, crearVersion);

// Activar versión
router.put("/:id/activar", authMiddleware, activarVersion);

export default router;
