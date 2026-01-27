import mysql from "mysql2/promise";
import { DB_HOST, DB_NAME, DB_USER, DB_PASS, DB_PORT } from "./config.js";

export const conmysql = mysql.createPool({
  host: DB_HOST,
  user: DB_USER,
  password: DB_PASS,
  database: DB_NAME,
  port: DB_PORT,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Verificar conexión (se ejecuta al iniciar)
export async function probarConexion() {
  try {
    const connection = await conmysql.getConnection();
    console.log("✅ Conectado a MySQL:", DB_NAME);
    connection.release();
  } catch (err) {
    console.error("❌ Error conectando a MySQL:", err.message);
    throw err;
  }
}
