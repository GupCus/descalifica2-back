import { Router } from "express";
import { generarcodigo, verificarVinculacion, desvincularTelegram } from "./telegram.controller.js";
import { authenticateToken } from "../../auth/auth.middleware.js";
import { authenticateAdmin } from "../../auth/auth.middleware.js";
import { enviarTopPostSemanal } from "./telegram.service.js";

export const telegramrouter = Router();
telegramrouter.post("/generarcodigo", authenticateToken, generarcodigo);
telegramrouter.get("/verificar", authenticateToken, verificarVinculacion);
telegramrouter.delete("/desvincular", authenticateToken, desvincularTelegram);

// Endpoint de test para disparar manualmente el envío del top post semanal (solo admin)
telegramrouter.post("/test-top-semanal", authenticateAdmin, async (_req, res) => {
  try {
    await enviarTopPostSemanal();
    res.status(200).json({ message: "Envío del top post semanal ejecutado." });
  } catch (error: any) {
    res.status(500).json({ message: "Error al enviar", error: error.message });
  }
});
