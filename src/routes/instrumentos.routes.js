import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { listarInstrumentos } from "../controladores/instrumentos.controller.js";

const router = Router();

router.get("/", authMiddleware, listarInstrumentos);

export default router;
