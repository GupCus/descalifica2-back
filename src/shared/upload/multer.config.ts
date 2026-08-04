import multer from "multer";
import path from "node:path";
import fs from "node:fs";
import { Request } from "express";

export const UPLOADS_BASE = path.resolve("uploads");

const storage = multer.diskStorage({
  destination: (req: Request, file, cb) => {
    // _uploadPath se setea por el middleware setUploadPath()
    const dest = path.join(UPLOADS_BASE, (req as any)._uploadPath || "misc");
    // Crear directorio si no existe
    fs.mkdirSync(dest, { recursive: true });
    cb(null, dest);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `${uniqueSuffix}${ext}`);
  },
});

const ALLOWED_MIMES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/svg+xml",
];

const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  if (ALLOWED_MIMES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Tipo de archivo no permitido. Solo se aceptan imágenes (JPEG, PNG, WebP, SVG)."
      )
    );
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});
