import { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import { upload, detectImageType } from './multer.config.js';
import multer from 'multer';
import fs from 'node:fs/promises';
import path from 'node:path';

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
 * Middleware que valida el contenido real del archivo subido (magic bytes)
 * y asigna la extensión en base al tipo detectado (nunca del originalname).
 */
export async function validateUploadedFile(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  if (!req.file) {
    return next();
  }

  const filePath = req.file.path;

  try {
    const fileHandle = await fs.open(filePath, 'r');
    const buffer = Buffer.alloc(16);
    const { bytesRead } = await fileHandle.read(buffer, 0, 16, 0);
    await fileHandle.close();

    const detected = detectImageType(buffer.subarray(0, bytesRead));

    if (!detected) {
      await fs.unlink(filePath).catch(() => {});
      return next(
        new Error(
          'Tipo de archivo no permitido. El contenido real no corresponde a una imagen válida (JPEG, PNG, WebP).',
        ),
      );
    }

    const ext = path.extname(req.file.filename);
    const baseFilename = ext
      ? req.file.filename.slice(0, -ext.length)
      : req.file.filename;
    const newFilename = `${baseFilename}${detected.ext}`;
    const newPath = path.join(req.file.destination, newFilename);

    if (newPath !== filePath) {
      await fs.rename(filePath, newPath);
    }

    req.file.filename = newFilename;
    req.file.path = newPath;
    req.file.mimetype = detected.mime;

    return next();
  } catch (err) {
    await fs.unlink(filePath).catch(() => {});
    return next(err);
  }
}

/**
 * Factory: genera un array de middlewares para upload de imagen obligatorio
 * Uso en rutas dedicadas: ...uploadImage("pilotos", "profile")
 */
export function uploadImage(
  entityFolder: string,
  subfolder: string = '',
  fieldName: string = 'image',
) {
  return [
    setUploadPath(entityFolder, subfolder),
    upload.single(fieldName),
    validateUploadedFile,
  ];
}

/**
 * Factory: genera un array de middlewares para upload de imagen opcional
 * Uso en POST/PUT/PATCH de datos: ...uploadImageOptional("pilotos", "profile")
 * Parsea multipart/form-data y pone los campos de texto en req.body
 */
export function uploadImageOptional(
  entityFolder: string,
  subfolder: string = '',
  fieldName: string = 'image',
) {
  return [
    setUploadPath(entityFolder, subfolder),
    upload.single(fieldName),
    validateUploadedFile,
  ];
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
    return res.status(400).json({ message: 'Error al procesar el archivo subido.' });
  }

  if (err.message?.includes('Tipo de archivo no permitido')) {
    return res.status(415).json({ message: err.message });
  }

  next(err);
};
