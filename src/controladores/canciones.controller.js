import { conmysql } from "../db.js";

export const listarCanciones = async (req, res, next) => {
  try {
    const [rows] = await conmysql.query(
      "SELECT id, titulo, autor, tono_original, bpm, activa, created_at FROM canciones ORDER BY id DESC"
    );
    res.json({ ok: true, data: rows });
  } catch (e) {
    next(e);
  }
};

export const obtenerCancion = async (req, res, next) => {
  try {
    const { id } = req.params;
    const [rows] = await conmysql.query("SELECT * FROM canciones WHERE id = ? LIMIT 1", [id]);

    if (!rows[0]) return res.status(404).json({ ok: false, error: "Canción no encontrada" });
    res.json({ ok: true, data: rows[0] });
  } catch (e) {
    next(e);
  }
};

export const crearCancion = async (req, res, next) => {
  try {
    const { titulo, autor = null, tono_original = null, bpm = null, letra = null } = req.body;

    if (!titulo) return res.status(400).json({ ok: false, error: "titulo requerido" });

    const [result] = await conmysql.query(
      "INSERT INTO canciones (titulo, autor, tono_original, bpm, letra, activa) VALUES (?, ?, ?, ?, ?, true)",
      [titulo, autor, tono_original, bpm, letra]
    );

    res.status(201).json({ ok: true, data: { id: result.insertId } });
  } catch (e) {
    next(e);
  }
};

export const actualizarCancion = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { titulo, autor, tono_original, bpm, letra, activa } = req.body;

    const [result] = await conmysql.query(
      `UPDATE canciones SET
        titulo = COALESCE(?, titulo),
        autor = COALESCE(?, autor),
        tono_original = COALESCE(?, tono_original),
        bpm = COALESCE(?, bpm),
        letra = COALESCE(?, letra),
        activa = COALESCE(?, activa)
      WHERE id = ?`,
      [titulo ?? null, autor ?? null, tono_original ?? null, bpm ?? null, letra ?? null, activa ?? null, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ ok: false, error: "Canción no encontrada" });
    }

    res.json({ ok: true, message: "Canción actualizada" });
  } catch (e) {
    next(e);
  }
};
