import { conmysql } from "../db.js";

export const requireSongEdit = async (req, res, next) => {
  try {
    const songId =
      req.params.id ||
      req.params.songId ||
      req.body.cancion_id;

    if (!songId) {
      return res.status(400).json({ ok: false, error: "songId requerido" });
    }

    // Admin siempre puede
    if (req.user?.rol_id === 1) return next();

    const userId = req.user?.id;

    const [rows] = await conmysql.query(
      "SELECT permission FROM song_collaborators WHERE song_id = ? AND user_id = ? LIMIT 1",
      [songId, userId]
    );

    if (!rows[0] || rows[0].permission !== "edit") {
      return res
        .status(403)
        .json({ ok: false, error: "No tienes permiso para editar esta canción" });
    }

    next();
  } catch (e) {
    next(e);
  }
};