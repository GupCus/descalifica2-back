import { Request, Response } from "express";
import path from "node:path";
import fs from "node:fs";
import { UPLOADS_BASE } from "../shared/upload/multer.config.js";

export const getAsset = (req: Request, res: Response) => {
  // En Express, el comodín '*' se captura en req.params[0]
  const relativePath = req.params[0];

  if (!relativePath) {
    return res.status(400).json({ message: "Ruta no proporcionada." });
  }

  // Validación básica para prevenir Directory Traversal
  if (relativePath.includes("..")) {
    return res.status(400).json({ message: "Ruta de archivo inválida." });
  }

  // Construir la ruta absoluta del archivo
  const absolutePath = path.join(UPLOADS_BASE, relativePath);

  // Verificar si el archivo existe
  if (!fs.existsSync(absolutePath)) {
    return res.status(404).json({ message: "Asset no encontrado." });
  }

  // Enviar el archivo con caché de 30 días (en milisegundos)
  res.sendFile(absolutePath, { maxAge: 30 * 24 * 60 * 60 * 1000 });
};
