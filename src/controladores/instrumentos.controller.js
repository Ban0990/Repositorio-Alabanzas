import { conmysql } from "../db.js";

export const listarInstrumentos = async (req, res, next) => {
  try {
    const [rows] = await conmysql.query("SELECT id, nombre FROM instrumentos ORDER BY id ASC");
    res.json({ ok: true, data: rows });
  } catch (e) {
    next(e);
  }
};
