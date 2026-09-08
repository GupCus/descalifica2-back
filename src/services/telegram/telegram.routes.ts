import { Router } from "express";
import { generarcodigo } from "./telegram.controller.js";
import { authenticateToken } from "../../auth/auth.middleware.js";

export const telegramrouter = Router();
telegramrouter.post("/generarcodigo", authenticateToken, generarcodigo);
