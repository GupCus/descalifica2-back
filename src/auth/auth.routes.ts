import { Router } from "express";
import {
  authenticateToken,
  sanitizeLogin,
  sanitizeRegister,
} from "./auth.middleware.js";
import { upload } from "../shared/middlewares/multer.config.js";
import { setUploadPath } from "../shared/upload/upload.middleware.js";
import { loginGoogle } from "../services/OAuth/oauth.service.js";
import { checkToken, login, register } from "./auth.controller.js";

export const authRouter = Router();

authRouter.post("/login", sanitizeLogin, login);
authRouter.post(
  "/register",
  setUploadPath("avatars"),
  upload.single("avatar"),
  sanitizeRegister,
  register,
);
authRouter.get("/check-token", authenticateToken, (req, res) =>
  checkToken(req as any, res),
);
authRouter.post("/login/google", loginGoogle, sanitizeLogin, login);
