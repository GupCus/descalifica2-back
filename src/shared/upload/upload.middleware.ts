import { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import { upload } from './multer.config.js';
import multer from 'multer';

/**
 * Middleware que setea la ruta de destino para el upload
 */
export function setUploadPath(entityFolder: string, subfolder: string = '') {
  return (req: Request, res: Response, next: NextFunction) => {
    (req as any)._uploadPath = subfolder
      ? `${entityFolder}/${subfolder}`
      : entityFolder;
    next();
  };
}

/**
 * Factory: genera un array de middlewares para upload de imagen obligatorio
 * Uso en rutas dedicadas: ...uploadImage("pilotos", "profile")
 */
export function uploadImage(entityFolder: string, subfolder: string) {
  return [setUploadPath(entityFolder, subfolder), upload.single('image')];
}

/**
 * Factory: genera un array de middlewares para upload de imagen opcional
 * Uso en POST/PUT/PATCH de datos: ...uploadImageOptional("pilotos", "profile")
 * Parsea multipart/form-data y pone los campos de texto en req.body
 */
export function uploadImageOptional(entityFolder: string, subfolder: string) {
  return [setUploadPath(entityFolder, subfolder), upload.single('image')];
}

/**
 * Middleware de manejo de errores de subida con Multer
 */
export const handleMulterErrors: ErrorRequestHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res
        .status(413)
        .json({ message: 'El archivo excede el tamaño máximo de 5MB' });
    }
    return res.status(400).json({ message: `Error de upload: ${err.message}` });
  }

  if (err.message?.includes('Tipo de archivo no permitido')) {
    return res.status(415).json({ message: err.message });
  }

  next(err);
};
