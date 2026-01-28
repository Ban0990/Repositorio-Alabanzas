import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { uploadMemory } from "../middlewares/upload-memory.middleware.js";
import {
  subirAudio,
  listarAudiosPorCancion,
  eliminarAudio,
} from "../controladores/audios.controller.js";

const router = Router();

router.get("/cancion/:cancionId", authMiddleware, listarAudiosPorCancion);

// form-data: audio(file), cancion_id, instrumento_id(opcional), tipo(opcional)
router.post("/", authMiddleware, uploadMemory.single("audio"), subirAudio);

router.delete("/:id", authMiddleware, eliminarAudio);

export default router;
