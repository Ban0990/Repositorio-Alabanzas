import { conmysql } from "../db.js";

export const listarArtistas = async (req, res) => {
  try {
    const [rows] = await conmysql.query(`
      SELECT DISTINCT autor 
      FROM canciones
      WHERE autor IS NOT NULL
        AND autor <> ''
      ORDER BY autor ASC
    `);

    const artistas = rows.map(r => r.autor);

    res.json({
      ok: true,
      data: artistas
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      ok: false,
      error: "Error al obtener artistas"
    });
  }
};
