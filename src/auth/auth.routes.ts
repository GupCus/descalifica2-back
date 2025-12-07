import { Router } from "express";
import { AuthController } from "./auth.controller.js";
import { authenticateAdmin, authenticateToken } from "./auth.middleware.js";

export const authRouter = Router();
const authController = new AuthController();
