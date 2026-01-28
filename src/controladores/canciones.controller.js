import { conmysql } from "../db.js";

export const listarCanciones = async (req, res, next) => {
  try {
    const { search, tono, bpm_min, bpm_max, activa, page = 1, limit = 20 } = req.query;

    const p = Math.max(parseInt(page, 10) || 1, 1);
    const l = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100); // máx 100
    const offset = (p - 1) * l;

    let where = "WHERE 1=1";
    const params = [];

    if (search) {
      where += " AND (titulo LIKE ? OR autor LIKE ?)";
      params.push(`%${search}%`, `%${search}%`);
    }

    if (tono) {
      where += " AND tono_original = ?";
      params.push(tono);
    }

    if (activa !== undefined) {
      where += " AND activa = ?";
      params.push(Number(activa) ? 1 : 0);
    }

    if (bpm_min) {
      where += " AND bpm >= ?";
      params.push(Number(bpm_min));
    }

    if (bpm_max) {
      where += " AND bpm <= ?";
      params.push(Number(bpm_max));
    }

    // total (para paginación)
    const [countRows] = await conmysql.query(
      `SELECT COUNT(*) AS total FROM canciones ${where}`,
      params
    );
    const total = countRows[0]?.total || 0;

    // data
    const [rows] = await conmysql.query(
      `SELECT id, titulo, autor, tono_original, bpm, activa, created_at
       FROM canciones
       ${where}
       ORDER BY id DESC
       LIMIT ? OFFSET ?`,
      [...params, l, offset]
    );

    return res.json({
      ok: true,
      meta: {
        page: p,
        limit: l,
        total,
        total_pages: Math.ceil(total / l),
      },
      data: rows,
    });
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

export const detalleCancion = async (req, res, next) => {
  try {
    const { id } = req.params;

    // 1) canción
    const [songRows] = await conmysql.query("SELECT * FROM canciones WHERE id = ? LIMIT 1", [id]);
    const song = songRows[0];
    if (!song) return res.status(404).json({ ok: false, error: "Canción no encontrada" });

    // 2) instrumentos
    const [instRows] = await conmysql.query("SELECT id, nombre FROM instrumentos ORDER BY id ASC");

    // 3) versiones actuales por instrumento (solo es_actual=1)
    const [verRows] = await conmysql.query(
      `SELECT va.id, va.instrumento_id, va.tono, va.bpm, va.contenido, va.creado_por, va.created_at
       FROM versiones_acordes va
       WHERE va.cancion_id = ? AND va.es_actual = true`,
      [id]
    );

    // 4) audios
    const [audioRows] = await conmysql.query(
      `SELECT id, instrumento_id, url, tipo, created_at
       FROM audios
       WHERE cancion_id = ?
       ORDER BY created_at DESC`,
      [id]
    );

    // 5) ritmos
    const [ritmoRows] = await conmysql.query(
      `SELECT id, bpm, compas, patron, creado_por, created_at
       FROM ritmos
       WHERE cancion_id = ?
       ORDER BY created_at DESC`,
      [id]
    );

    // map versiones por instrumento_id
    const versionActualByInstrumento = {};
    for (const v of verRows) versionActualByInstrumento[v.instrumento_id] = v;

    // respuesta final “lista para app”
    const instrumentos = instRows.map((i) => ({
      ...i,
      version_actual: versionActualByInstrumento[i.id] || null,
    }));

    return res.json({
      ok: true,
      data: {
        cancion: song,
        instrumentos,
        audios: audioRows,
        ritmos: ritmoRows,
      },
    });
  } catch (e) {
    next(e);
  }
};
