import { Router } from "express";
import { login, me } from "../controladores/auth.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();

// Login (no requiere token)
router.post("/login", login);

// Perfil del usuario autenticado
router.get("/me", authMiddleware, me);

export default router;
