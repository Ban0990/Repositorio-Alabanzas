import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { conmysql } from "../db.js";
import { JWT_SECRET } from "../config.js";

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ ok: false, error: "email y password son requeridos" });
    }

    const [rows] = await conmysql.query(
      "SELECT id, nombre, email, password_hash, rol_id, activo FROM usuarios WHERE email = ? LIMIT 1",
      [email]
    );

    const user = rows[0];
    if (!user) return res.status(401).json({ ok: false, error: "Credenciales inválidas" });
    if (!user.activo) return res.status(403).json({ ok: false, error: "Usuario inactivo" });

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return res.status(401).json({ ok: false, error: "Credenciales inválidas" });

    const token = jwt.sign(
      { id: user.id, email: user.email, rol_id: user.rol_id },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({ ok: true, token });
  } catch (e) {
    next(e);
  }
};

export const me = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const [rows] = await conmysql.query(
      "SELECT id, nombre, email, rol_id, activo, created_at FROM usuarios WHERE id = ? LIMIT 1",
      [userId]
    );
    return res.json({ ok: true, data: rows[0] || null });
  } catch (e) {
    next(e);
  }
};
