import jwt from "jsonwebtoken";
import { JWT_SECRET, TOKEN_ESTATICO } from "../config.js";

export const verifyToken = (req, res, next) => {
  let token = req.headers["authorization"];

  if (!token) return res.status(403).json({ message: "Token no proporcionado" });

  if (token.startsWith("Bearer ")) token = token.slice(7);

  // ✅ Token estático SOLO en desarrollo
  if (process.env.NODE_ENV !== "production" && TOKEN_ESTATICO && token === TOKEN_ESTATICO) {
    // Inyectamos un "usuario del sistema" para que haya contexto
    req.user = { id: 0, rol_id: 1, email: "system@local" }; // admin por defecto
    req.userId = 0;
    return next();
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    // ✅ Guarda todo el payload útil
    req.user = decoded;       // ejemplo: { id, rol_id, email }
    req.userId = decoded.id;

    next();
  } catch (err) {
    return res.status(401).json({ message: "Token inválido o expirado" });
  }
};
