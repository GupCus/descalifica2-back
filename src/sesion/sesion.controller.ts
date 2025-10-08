import { Request, Response, NextFunction } from "express";
import { orm } from "../shared/db/orm.js";
import { Sesion } from "./sesion.entity.js";
import { Piloto } from "../piloto/piloto.entity.js";
import { NotFoundError } from "@mikro-orm/core";

const em = orm.em;

function sanitizeSesionInput(req: Request, res: Response, next: NextFunction) {
  req.body.sanitizedInput = {
    name: req.body.name,
    tipoSesion: req.body.tipoSesion,
    fecha_Hora_sesion: req.body.fecha
      ? new Date(req.body.fecha_Hora_sesion)
      : req.body.fecha_Hora_sesion,
    carrera: req.body.carrera,
    //grilla: req.body.grilla,
    resultados: req.body.resultados,
    id: req.params.id,
  };

  Object.keys(req.body.sanitizedInput).forEach((key) => {
    if (req.body.sanitizedInput[key] === undefined) {
      delete req.body.sanitizedInput[key];
    }
  });
  next();
}

// Obtener todas las sesiones

async function findAll(req: Request, res: Response) {
  try {
    const sesiones = await em.find(Sesion, {}, { populate: ["resultados"] });
    res.status(200).json({ message: "OK", data: sesiones });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

// Obtener una sesión específica

async function findOne(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id);
    const sesion = await em.findOneOrFail(
      Sesion,
      { id },
      { populate: ["resultados"] }
    );
    res.status(200).json({ message: "OK", data: sesion });
  } catch (error: any) {
    if (error instanceof NotFoundError) {
      res.status(404).json({ message: "Resource not found" });
    } else {
      res.status(500).json({ message: "Internal server error" });
    }
  }
}

// Crear una sesion

async function add(req: Request, res: Response) {
  try {
    const sesionData = { ...req.body.sanitizedInput };

    // Crear la sesión sin las relaciones primero
    const { grilla, resultados, ...sesionProps } = sesionData;
    const sesion = em.create(Sesion, sesionProps);

    // Si hay pilotos en resultados, agregarlos
    if (resultados && Array.isArray(resultados)) {
      for (const pilotoId of resultados) {
        const piloto = await em.findOne(Piloto, { id: pilotoId });
        if (piloto) sesion.resultados.add(piloto);
      }
    }

    await em.flush();
    res
      .status(201)
      .json({ message: "Sesion created successfully", data: sesion });
  } catch (error: any) {
    console.error("Error creating sesion:", error);
    res.status(500).json({ message: error.message });
  }
}

// Actualizar una sesión

async function update(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id);
    const sesion = await em.findOneOrFail(Sesion, { id });
    em.assign(sesion, req.body.sanitizedInput);
    await em.flush();
    res.status(204).json({ message: "Updated" });
  } catch (error: any) {
    if (error instanceof NotFoundError) {
      res.status(404).json({ message: "Resource not found" });
    } else {
      res.status(500).json({ message: "Internal server error" });
    }
  }
}

// Eliminar una sesión

async function remove(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id);
    const sesion = em.getReference(Sesion, id);
    await em.removeAndFlush(sesion);
    res.status(204).json({ message: "Deleted" });
  } catch (error: any) {
    if (error instanceof NotFoundError) {
      res.status(404).json({ message: "Resource not found" });
    } else {
      res.status(500).json({ message: "Internal server error" });
    }
  }
}

export { findAll, findOne, add, update, remove, sanitizeSesionInput };
