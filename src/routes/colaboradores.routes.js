import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { requireRole } from "../middlewares/roles.middleware.js";
import {
  listarColaboradores,
  agregarColaborador,
  quitarColaborador,
} from "../controladores/colaboradores.controller.js";

const router = Router();

// Solo admin
router.get("/:songId", authMiddleware, requireRole([1]), listarColaboradores);
router.post("/:songId", authMiddleware, requireRole([1]), agregarColaborador);
router.delete("/:songId/:userId", authMiddleware, requireRole([1]), quitarColaborador);

export default router;