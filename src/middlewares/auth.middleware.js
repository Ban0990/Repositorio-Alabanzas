import jwt from "jsonwebtoken";
import { JWT_SECRET, TOKEN_ESTATICO } from "../config.js";

export const authMiddleware = (req, res, next) => {
  try {
    let header = req.headers["authorization"];

    if (!header) {
      return res.status(401).json({ ok: false, error: "Token no proporcionado" });
    }

    // Bearer TOKEN
    if (header.startsWith("Bearer ")) header = header.slice(7);
    const token = header.trim();

    // ✅ Token estático SOLO en desarrollo
    if (process.env.NODE_ENV !== "production" && TOKEN_ESTATICO && token === TOKEN_ESTATICO) {
      req.user = { id: 0, rol_id: 1, email: "system@local" }; // admin
      return next();
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    // ✅ guardamos info del usuario para usar en controladores
    // Debe venir del token: { id, rol_id, email }
    req.user = decoded;

    return next();
  } catch (err) {
    return res.status(401).json({ ok: false, error: "Token inválido o expirado" });
  }
};
