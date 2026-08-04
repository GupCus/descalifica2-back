import fs from "node:fs/promises";
import path from "node:path";
import { UPLOADS_BASE } from "./multer.config.js";

/**
 * Elimina un archivo del disco dado su path relativo a UPLOADS_BASE
 */
export async function deleteFile(relativePath: string): Promise<void> {
  try {
    const fullPath = path.join(UPLOADS_BASE, relativePath);
    await fs.unlink(fullPath);
  } catch (error: any) {
    // Si el archivo no existe, ignorar silenciosamente
    if (error.code !== "ENOENT") {
      console.error(`Error eliminando archivo ${relativePath}:`, error);
    }
  }
}

/**
 * Construye la URL completa de una imagen a partir de su ruta relativa
 * Devuelve null si no hay ruta
 */
export function buildImageUrl(
  req: { protocol: string; get: (h: string) => string | undefined },
  relativePath: string | undefined | null
): string | null {
  if (!relativePath) return null;
  const host = req.get("host") || "localhost:3000";
  return `${req.protocol}://${host}/uploads/${relativePath}`;
}

/**
 * Obtiene la ruta relativa (respecto a UPLOADS_BASE) desde un path absoluto de Multer
 */
export function getRelativePath(absolutePath: string): string {
  return path.relative(UPLOADS_BASE, absolutePath);
}
