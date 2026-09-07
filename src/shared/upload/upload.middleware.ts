import { Request, Response, NextFunction } from "express";
import { upload } from "./multer.config.js";

/**
 * Middleware que setea la ruta de destino para el upload
 */
export function setUploadPath(entityFolder: string, subfolder: string = "") {
  return (req: Request, res: Response, next: NextFunction) => {
    (req as any)._uploadPath = subfolder ? `${entityFolder}/${subfolder}` : entityFolder;
    next();
  };
}

/**
 * Factory: genera un array de middlewares para upload de imagen obligatorio
 * Uso en rutas dedicadas: ...uploadImage("pilotos", "profile")
 */
export function uploadImage(entityFolder: string, subfolder: string) {
  return [
    setUploadPath(entityFolder, subfolder),
    upload.single("image"),
  ];
}

/**
 * Factory: genera un array de middlewares para upload de imagen opcional
 * Uso en POST/PUT/PATCH de datos: ...uploadImageOptional("pilotos", "profile")
 * Parsea multipart/form-data y pone los campos de texto en req.body
 */
export function uploadImageOptional(entityFolder: string, subfolder: string) {
  return [
    setUploadPath(entityFolder, subfolder),
    upload.single("image"),
  ];
}
