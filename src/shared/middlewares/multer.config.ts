import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(process.cwd(), "uploads/avatars"));
  },
  filename: (req: any, file, cb) => {
    const base = (req.body?.username || "avatar").replace(/[^\w-]/g, "");
    const unique = Date.now();
    const ext = path.extname(file.originalname) || ".png";
    cb(null, `${base}-${unique}${ext}`);
  },
});

const fileFilter = (req: any, file: any, cb: any) => {
  const allowedMimes = ["image/jpeg", "image/png", "image/webp"];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Solo se permiten imágenes JPEG, PNG o WebP"));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});
