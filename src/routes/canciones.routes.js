import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import {
  listarCanciones,
  obtenerCancion,
  crearCancion,
  actualizarCancion,
  detalleCancion
} from "../controladores/canciones.controller.js";
import { requireSongEdit } from "../middlewares/song-permission.middleware.js";

const router = Router();

router.get("/", authMiddleware, listarCanciones);
router.get("/:id", authMiddleware, obtenerCancion);
router.get("/:id/detalle", authMiddleware, detalleCancion);
router.post("/", authMiddleware, crearCancion);
router.put("/:id", authMiddleware, requireSongEdit, actualizarCancion);

export default router;
