import { Router } from "express";
import { AuthController } from "./auth.controller.js";
import { authenticateAdmin, authenticateToken } from "./auth.middleware.js";

export const authRouter = Router();
const authController = new AuthController();

authRouter.post("/login", (req, res) => authController.login(req, res));
authRouter.post("/register", (req, res) => authController.register(req, res));
authRouter.get("/check-token", authenticateToken, (req, res) => authController.checkToken(req as any, res));
