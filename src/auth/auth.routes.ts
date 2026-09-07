import { Router } from "express";
import { AuthController } from "./auth.controller.js";
import { authenticateAdmin, authenticateToken } from "./auth.middleware.js";
import { upload } from "../shared/middlewares/multer.config.js";
import { setUploadPath } from "../shared/upload/upload.middleware.js";

export const authRouter = Router();
const authController = new AuthController();

authRouter.post("/login", authController.login);
authRouter.post(
  "/register",
  setUploadPath("avatars"),
  upload.single("avatar"),
  authController.register
);
authRouter.get("/check-token", authenticateToken, (req, res) =>
  authController.checkToken(req as any, res)
);
