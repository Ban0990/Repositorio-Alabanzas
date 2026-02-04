import { Router } from "express";
import { listarArtistas } from "../controladores/artistas.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/", authMiddleware, listarArtistas);

export default router;
