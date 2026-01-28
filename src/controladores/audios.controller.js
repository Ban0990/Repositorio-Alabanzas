import { conmysql } from "../db.js";
import cloudinary from "../config/cloudinary.js";
import { CLOUDINARY_FOLDER } from "../config.js";

// Subir buffer (multer memory) a Cloudinary
function uploadBufferToCloudinary(buffer, options = {}) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: CLOUDINARY_FOLDER || "repositorio-alabanzas",
        resource_type: "video", // ✅ Cloudinary usa "video" para audio/video
        ...options,
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    stream.end(buffer);
  });
}

// POST /api/audios  (form-data: audio, cancion_id, instrumento_id?, tipo?)
export const subirAudio = async (req, res, next) => {
  try {
    const { cancion_id, instrumento_id = null, tipo = null } = req.body;

    if (!cancion_id) {
      return res.status(400).json({ ok: false, error: "cancion_id requerido" });
    }

    if (!req.file) {
      return res
        .status(400)
        .json({ ok: false, error: "Archivo requerido (field: audio)" });
    }

    // Subir a Cloudinary
    const result = await uploadBufferToCloudinary(req.file.buffer, {
      tags: ["alabanza", "audio"],
    });

    const url = result.secure_url;
    const public_id = result.public_id;
    const duration_seconds = result.duration ? Math.round(result.duration) : null;

    // Guardar en DB
    const [dbres] = await conmysql.query(
      `INSERT INTO audios
        (cancion_id, instrumento_id, url, tipo, provider, public_id, duration_seconds)
       VALUES (?, ?, ?, ?, 'cloudinary', ?, ?)`,
      [cancion_id, instrumento_id, url, tipo, public_id, duration_seconds]
    );

    return res.status(201).json({
      ok: true,
      data: {
        id: dbres.insertId,
        url,
        public_id,
        duration_seconds,
      },
    });
  } catch (e) {
    next(e);
  }
};

// GET /api/audios/cancion/:cancionId
export const listarAudiosPorCancion = async (req, res, next) => {
  try {
    const { cancionId } = req.params;

    const [rows] = await conmysql.query(
      `SELECT id, cancion_id, instrumento_id, url, tipo, provider, public_id, duration_seconds, created_at
       FROM audios
       WHERE cancion_id = ?
       ORDER BY created_at DESC`,
      [cancionId]
    );

    return res.json({ ok: true, data: rows });
  } catch (e) {
    next(e);
  }
};

// DELETE /api/audios/:id
export const eliminarAudio = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [rows] = await conmysql.query(
      "SELECT id, provider, public_id FROM audios WHERE id = ? LIMIT 1",
      [id]
    );

    const audio = rows[0];
    if (!audio) {
      return res.status(404).json({ ok: false, error: "Audio no encontrado" });
    }

    // borrar en Cloudinary
    if (audio.provider === "cloudinary" && audio.public_id) {
      await cloudinary.uploader.destroy(audio.public_id, { resource_type: "video" });
    }

    await conmysql.query("DELETE FROM audios WHERE id = ?", [id]);

    return res.json({ ok: true, message: "Audio eliminado" });
  } catch (e) {
    next(e);
  }
};
