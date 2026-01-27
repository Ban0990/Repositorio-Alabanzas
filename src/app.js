import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

// Rutas
import authRoutes from "./routes/auth.routes.js";
import usuariosRoutes from "./routes/usuarios.routes.js";
import cancionesRoutes from "./routes/canciones.routes.js";
import instrumentosRoutes from "./routes/instrumentos.routes.js";
import versionesRoutes from "./routes/versiones.routes.js";

// Middleware de errores
import errorMiddleware from "./middlewares/error.middleware.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const corsOptions = {
  origin: "*",
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  credentials: true,
};

const app = express();

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ uploads está dentro de src según tu estructura
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ✅ Health check (útil para Render y pruebas)
app.get("/health", (req, res) => {
  res.json({ ok: true, message: "API OK" });
});

// ✅ Rutas API
app.use("/api/auth", authRoutes);
app.use("/api/usuarios", usuariosRoutes);
app.use("/api/canciones", cancionesRoutes);
app.use("/api/instrumentos", instrumentosRoutes);
app.use("/api/versiones", versionesRoutes);

// ✅ Middleware de errores (antes del 404 no, después de rutas sí)
app.use(errorMiddleware);

// ✅ 404 al final
app.use((req, res) => {
  res.status(404).json({ ok: false, error: "Endpoint not found" });
});

export default app;
