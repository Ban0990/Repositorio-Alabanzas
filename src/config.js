import { config } from "dotenv";
config();

export const DB_HOST = process.env.DB_HOST || "localhost";
export const DB_NAME = process.env.DB_NAME || "baseapp2025";
export const DB_USER = process.env.DB_USER || "root";
export const DB_PASS = process.env.DB_PASS || "";
export const DB_PORT = Number(process.env.DB_PORT || 3306);

export const PORT = Number(process.env.PORT || 3000);
// JWT and Token configuration
export const JWT_SECRET = process.env.JWT_SECRET || "clave_super_segura";
export const TOKEN_ESTATICO = process.env.TOKEN_ESTATICO || "";
// Cloudinary configuration
export const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || "";
export const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY || "";
export const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET || "";
export const CLOUDINARY_FOLDER = process.env.CLOUDINARY_FOLDER || "repositorio-alabanzas";
