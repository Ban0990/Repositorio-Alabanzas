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

    // 1) canción (incluye letra)
    const [songRows] = await conmysql.query(
      "SELECT id, titulo, autor, tono_original, bpm, letra, activa, created_at FROM canciones WHERE id = ? LIMIT 1",
      [id]
    );

    const song = songRows[0];
    if (!song) return res.status(404).json({ ok: false, error: "Canción no encontrada" });

    // 2) instrumentos
    const [instRows] = await conmysql.query(
      "SELECT id, nombre FROM instrumentos ORDER BY id ASC"
    );

    // 3) versiones ACTUALES por instrumento (solo es_actual=1) + nombre instrumento
    const [verRows] = await conmysql.query(
      `SELECT 
          va.id AS version_id,
          va.instrumento_id,
          i.nombre AS instrumento_nombre,
          va.tono,
          va.bpm,
          va.contenido,
          va.creado_por,
          va.created_at
       FROM versiones_acordes va
       JOIN instrumentos i ON i.id = va.instrumento_id
       WHERE va.cancion_id = ? AND va.es_actual = true
       ORDER BY va.instrumento_id ASC`,
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

    // map de version_actual por instrumento_id
    const versionActualByInstrumento = {};
    for (const v of verRows) versionActualByInstrumento[v.instrumento_id] = v;

    // instrumentos con version actual
    const instrumentos = instRows.map((i) => ({
      ...i,
      version_actual: versionActualByInstrumento[i.id] || null,
    }));

    // ✅ RESPUESTA PLANA (lo que tu frontend espera)
    return res.json({
      ok: true,
      data: {
        ...song,               // ← aquí viene letra
        instrumentos,
        audios: audioRows,
        ritmos: ritmoRows,
        versiones: verRows     // ← para tu select (instrumento_nombre, version_id)
      },
    });
  } catch (e) {
    next(e);
  }
};

  export const cancionesPorAutor = async (req, res) => {
  try {
    const { autor } = req.params;

    const [rows] = await conmysql.query(
      `SELECT id, titulo, autor, tono_original, bpm
       FROM canciones
       WHERE autor = ?
       ORDER BY titulo ASC`,
      [autor]
    );

    res.json({
      ok: true,
      data: rows
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      ok: false,
      error: "Error al obtener canciones por autor"
    });
  }
};
export const actualizarLetra = async (req, res) => {
  try {
    const { id } = req.params;
    const { letra } = req.body;

    await conmysql.query(
      "UPDATE canciones SET letra = ? WHERE id = ?",
      [letra, id]
    );

    res.json({
      ok: true,
      message: "Letra actualizada"
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      ok: false,
      error: "Error al actualizar letra"
    });
  }
};



