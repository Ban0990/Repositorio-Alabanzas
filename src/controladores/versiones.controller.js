import { conmysql } from "../db.js";
import { transposeContenido, transposeChord } from "../utils/transposer.js";

export const listarPorCancion = async (req, res, next) => {
  try {
    const { cancionId } = req.params;
    const instrumento = req.query.instrumento; // nombre opcional

    let sql = `
      SELECT va.*, i.nombre AS instrumento
      FROM versiones_acordes va
      JOIN instrumentos i ON i.id = va.instrumento_id
      WHERE va.cancion_id = ?
      ORDER BY va.created_at DESC
    `;
    const params = [cancionId];

    if (instrumento) {
      sql = `
        SELECT va.*, i.nombre AS instrumento
        FROM versiones_acordes va
        JOIN instrumentos i ON i.id = va.instrumento_id
        WHERE va.cancion_id = ? AND i.nombre = ?
        ORDER BY va.created_at DESC
      `;
      params.push(instrumento);
    }

    const [rows] = await conmysql.query(sql, params);
    res.json({ ok: true, data: rows });
  } catch (e) {
    next(e);
  }
};

export const crearVersion = async (req, res, next) => {
  try {
    const { cancion_id, instrumento_id, contenido, tono = null, bpm = null } = req.body;

    if (!cancion_id || !instrumento_id || !contenido) {
      return res.status(400).json({
        ok: false,
        error: "cancion_id, instrumento_id y contenido son requeridos",
      });
    }

    const [result] = await conmysql.query(
      `INSERT INTO versiones_acordes
        (cancion_id, instrumento_id, contenido, tono, bpm, creado_por, es_actual)
       VALUES (?, ?, ?, ?, ?, ?, false)`,
      [cancion_id, instrumento_id, JSON.stringify(contenido), tono, bpm, req.user.id]
    );

    res.status(201).json({ ok: true, data: { id: result.insertId } });
  } catch (e) {
    next(e);
  }
};

export const activarVersion = async (req, res, next) => {
  try {
    const { id } = req.params;

    // 1) buscar versión
    const [rows] = await conmysql.query(
      "SELECT id, cancion_id, instrumento_id FROM versiones_acordes WHERE id = ? LIMIT 1",
      [id]
    );
    const ver = rows[0];
    if (!ver) return res.status(404).json({ ok: false, error: "Versión no encontrada" });

    // 2) desactivar otras versiones actuales del mismo cancion+instrumento
    await conmysql.query(
      "UPDATE versiones_acordes SET es_actual = false WHERE cancion_id = ? AND instrumento_id = ?",
      [ver.cancion_id, ver.instrumento_id]
    );

    // 3) activar esta versión
    await conmysql.query("UPDATE versiones_acordes SET es_actual = true WHERE id = ?", [ver.id]);

    // 4) registrar historial
    await conmysql.query(
      "INSERT INTO historial_cambios (version_id, usuario_id, accion) VALUES (?, ?, ?)",
      [ver.id, req.user.id, "activar_version"]
    );

    res.json({ ok: true, message: "Versión activada" });
  } catch (e) {
    next(e);
  }
};
// cambio de tono en tiempo real
export const transponerVersion = async (req, res, next) => {
  try {
    const { id } = req.params;
    const semitonos = Number(req.query.semitonos || 0);

    if (!Number.isFinite(semitonos) || semitonos < -24 || semitonos > 24) {
      return res.status(400).json({ ok: false, error: "semitonos inválido (-24 a 24)" });
    }

    const [rows] = await conmysql.query(
      "SELECT id, cancion_id, instrumento_id, contenido, tono, bpm, created_at FROM versiones_acordes WHERE id = ? LIMIT 1",
      [id]
    );

    const ver = rows[0];
    if (!ver) return res.status(404).json({ ok: false, error: "Versión no encontrada" });

    const contenidoObj = typeof ver.contenido === "string" ? JSON.parse(ver.contenido) : ver.contenido;

    const contenidoTranspuesto = transposeContenido(contenidoObj, semitonos);

    // tono resultante (si existe tono)
    const tonoFinal = ver.tono ? transposeChord(ver.tono, semitonos) : null;

    return res.json({
      ok: true,
      data: {
        version_id: ver.id,
        semitonos,
        tono_original: ver.tono || null,
        tono_final: tonoFinal,
        bpm: ver.bpm,
        contenido: contenidoTranspuesto,
      },
    });
  } catch (e) {
    next(e);
  }
};
