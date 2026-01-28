import { conmysql } from "../db.js";

export const listarColaboradores = async (req, res, next) => {
  try {
    const { songId } = req.params;

    const [rows] = await conmysql.query(
      `SELECT sc.user_id, sc.permission, u.nombre, u.email
       FROM song_collaborators sc
       JOIN usuarios u ON u.id = sc.user_id
       WHERE sc.song_id = ?
       ORDER BY u.nombre`,
      [songId]
    );

    res.json({ ok: true, data: rows });
  } catch (e) {
    next(e);
  }
};

export const agregarColaborador = async (req, res, next) => {
  try {
    const { songId } = req.params;
    const { user_id, permission = "edit" } = req.body;

    await conmysql.query(
      "INSERT INTO song_collaborators (song_id, user_id, permission) VALUES (?, ?, ?)",
      [songId, user_id, permission]
    );

    res.status(201).json({ ok: true, message: "Colaborador agregado" });
  } catch (e) {
    if (e.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ ok: false, error: "Ya es colaborador" });
    }
    next(e);
  }
};

export const quitarColaborador = async (req, res, next) => {
  try {
    const { songId, userId } = req.params;

    await conmysql.query(
      "DELETE FROM song_collaborators WHERE song_id = ? AND user_id = ?",
      [songId, userId]
    );

    res.json({ ok: true, message: "Colaborador eliminado" });
  } catch (e) {
    next(e);
  }
};