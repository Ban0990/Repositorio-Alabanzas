import bcrypt from "bcryptjs";
import { conmysql } from "../db.js";

export const listarUsuarios = async (req, res, next) => {
  try {
    const [rows] = await conmysql.query(
      "SELECT id, nombre, email, rol_id, activo, created_at FROM usuarios ORDER BY id DESC"
    );
    res.json({ ok: true, data: rows });
  } catch (e) {
    next(e);
  }
};

export const crearUsuario = async (req, res, next) => {
  try {
    const { nombre, email, password, rol_id = 2 } = req.body;

    if (!nombre || !email || !password) {
      return res.status(400).json({ ok: false, error: "nombre, email, password requeridos" });
    }

    const password_hash = await bcrypt.hash(password, 10);

    await conmysql.query(
      "INSERT INTO usuarios (nombre, email, password_hash, rol_id, activo) VALUES (?, ?, ?, ?, true)",
      [nombre, email, password_hash, rol_id]
    );

    res.status(201).json({ ok: true, message: "Usuario creado" });
  } catch (e) {
    if (e.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ ok: false, error: "Email ya existe" });
    }
    next(e);
  }
};
