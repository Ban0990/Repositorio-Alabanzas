import jwt from "jsonwebtoken";
import { JWT_SECRET, TOKEN_ESTATICO, NODE_ENV } from "../config.js";

export const verifyToken = (req, res, next) => {
  let token = req.headers["authorization"];
  if (!token) return res.status(403).json({ message: "Token no proporcionado" });

  if (token.startsWith("Bearer ")) token = token.slice(7);

  // ✅ Solo permitir token estático en development
  if (NODE_ENV !== "production" && TOKEN_ESTATICO && token === TOKEN_ESTATICO) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // 👈 mejor guardar todo
    next();
  } catch {
    return res.status(401).json({ message: "Token inválido o expirado" });
  }
};
