import { Router } from "express";
import { getAsset } from "./asset.controller.js";

export const assetRouter = Router();

// Usamos wildcard (*) para poder capturar rutas completas como "pilotos/profile/123.png"
assetRouter.get("/*", getAsset);
