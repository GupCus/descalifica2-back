import { Request, Response } from 'express';
import path from 'node:path';
import fs from 'node:fs';
import { UPLOADS_BASE } from '../shared/upload/multer.config.js';

const SAFE_IMAGE_MIMES: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
};

export const getAsset = (req: Request, res: Response) => {
  /*
    #swagger.tags = ['Assets']
    #swagger.summary = 'Obtener una imagen'
    //No se como responde esto sinceramente
    #swagger.responses[200] = { description: 'Archivo' }
    #swagger.responses[404] = { schema: { $ref: '#/components/schemas/NotFound' } }
  */
  // En Express, el comodín '*' se captura en req.params[0]
  const relativePath = req.params[0];

  if (!relativePath) {
    return res.status(400).json({ message: 'Ruta no proporcionada.' });
  }

  // Validación básica para prevenir Directory Traversal
  if (relativePath.includes('..')) {
    return res.status(400).json({ message: 'Ruta de archivo inválida.' });
  }

  // Si trae el prefijo 'uploads/', lo removemos ya que UPLOADS_BASE ya es la carpeta de uploads
  const cleanRelativePath = relativePath.replace(/^uploads\//, '');

  // Construir y validar la ruta absoluta canónica del archivo
  const absolutePath = path.resolve(UPLOADS_BASE, cleanRelativePath);
  if (
    absolutePath !== UPLOADS_BASE &&
    !absolutePath.startsWith(UPLOADS_BASE + path.sep)
  ) {
    return res.status(400).json({ message: 'Ruta de archivo inválida.' });
  }

  // Verificar si el archivo existe y es un archivo regular
  if (!fs.existsSync(absolutePath) || !fs.statSync(absolutePath).isFile()) {
    return res.status(404).json({ message: 'Asset no encontrado.' });
  }

  const ext = path.extname(absolutePath).toLowerCase();
  const safeFilename = path.basename(absolutePath).replace(/["\\\r\n]/g, '_');
  const normalizedRel = path
    .relative(UPLOADS_BASE, absolutePath)
    .replace(/\\/g, '/');
  const isStaticFlagSvg =
    ext === '.svg' && normalizedRel.startsWith('flags/');

  // Cabeceras de seguridad contra MIME-sniffing y ejecución de contenido activo
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'none'; style-src 'unsafe-inline'; sandbox",
  );

  if (SAFE_IMAGE_MIMES[ext]) {
    res.setHeader('Content-Type', SAFE_IMAGE_MIMES[ext]);
    res.setHeader(
      'Content-Disposition',
      `inline; filename="${safeFilename}"`,
    );
  } else if (isStaticFlagSvg) {
    res.setHeader('Content-Type', 'image/svg+xml');
    res.setHeader(
      'Content-Disposition',
      `inline; filename="${safeFilename}"`,
    );
  } else {
    // Cualquier archivo con extensión no permitida no se renderiza inline
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${safeFilename}"`,
    );
  }

  // Enviar el archivo con caché de 30 días (en milisegundos)
  res.sendFile(absolutePath, { maxAge: 30 * 24 * 60 * 60 * 1000 });
};
