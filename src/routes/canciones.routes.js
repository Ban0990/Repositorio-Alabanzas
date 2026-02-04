import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import {
  listarCanciones,
  obtenerCancion,
  crearCancion,
  actualizarCancion,
  detalleCancion,
  cancionesPorAutor,
  actualizarLetra
} from "../controladores/canciones.controller.js";
import { requireSongEdit } from "../middlewares/song-permission.middleware.js";

const router = Router();

router.get("/", authMiddleware, listarCanciones);
router.get("/:id", authMiddleware, obtenerCancion);
router.get("/:id/detalle", authMiddleware, detalleCancion);
router.get("/autor/:autor", authMiddleware, cancionesPorAutor);
router.post("/", authMiddleware, crearCancion);
router.put("/:id", authMiddleware, requireSongEdit, actualizarCancion);
router.put("/:id/letra", authMiddleware, actualizarLetra);


export default router;
