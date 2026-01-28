import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { requireRole } from "../middlewares/roles.middleware.js";
import { listarUsuarios, crearUsuario } from "../controladores/usuarios.controller.js";

const router = Router();

// admin=1
router.get("/", authMiddleware, requireRole([1]), listarUsuarios);
router.post("/", authMiddleware, requireRole([1]), crearUsuario);

export default router;
