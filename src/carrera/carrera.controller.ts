import { Request, Response, NextFunction } from "express";
import { Carrera } from "./carrera.entity.js";
import { orm } from "../shared/db/orm.js";
import { NotFoundError } from "@mikro-orm/core";
import { Sesion } from "../sesion/sesion.entity.js";

const em = orm.em;
function sanitizeCarrera(req: Request, res: Response, next: NextFunction) {
  req.body.sanitizedInput = {
    id: req.body.id,
    name: req.body.name,
    start_date: req.body.start_date ? new Date(req.body.start_date) : undefined,
    end_date: req.body.end_date ? new Date(req.body.end_date) : undefined,
    season: req.body.season,
    track: req.body.track ? Number(req.body.track) : undefined,
  };
  Object.keys(req.body.sanitizedInput).forEach((key) => {
    if (req.body.sanitizedInput[key] === undefined) {
      delete req.body.sanitizedInput[key];
    }
  });
  next();
}

//Traer todas las carreras
async function findAll(req: Request, res: Response) {
  try {
    const carreras = await em.find(
      Carrera,
      {},
      {
        populate: ["track", "season", "sessions", "season.racing_series"],
      }
    );
    res.status(200).json({ message: "OK", data: carreras });
  } catch (error: any) {
    res.status(500).json({ message: "message: error.message" });
  }
}
async function findOne(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id);
    const carrera = await em.findOneOrFail(
      Carrera,
      { id },
      {
        populate: ["track", "season", "sessions"],
      }
    );
    res.status(200).json({ message: "OK", data: carrera });
  } catch (error: any) {
    if (error instanceof NotFoundError) {
      res.status(404).json({ message: "Resource not found" });
    } else {
      res.status(500).json({ message: "Internal server error" });
    }
  }
}

async function add(req: Request, res: Response) {
  try {
    const input = { ...req.body.sanitizedInput };
    const sessionsInput = input.sessions;
    delete input.sessions;

    const carrera = em.create(Carrera, input);
    await em.flush();

    if (Array.isArray(sessionsInput) && sessionsInput.length > 0) {
      for (const s of sessionsInput) {
        if (typeof s === "object" && s !== null) {
          // Crear nueva session y asociarla a la carrera
          em.create(Sesion, { ...s, carrera });
        } else if (typeof s === "number" || /^\d+$/.test(s)) {
          // si viene un id,busca la session y la asocia.
          const found_sesion = await em.findOne(Sesion, { id: Number(s) });
          if (found_sesion) {
            found_sesion.race = carrera;
          }
        }
      }
      await em.flush();
    }
    // Populate las relaciones para mostrar información completa
    await em.populate(carrera, ["track", "season", "sessions"]);
    res
      .status(201)
      .json({ message: "Carrera created successfully", data: carrera });
  } catch (error: any) {
    console.error("Error creating carrera:", error);
    res.status(500).json({ message: error.message });
  }
}

async function update(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id);
    const carrera = await em.findOneOrFail(Carrera, { id });
    em.assign(carrera, req.body.sanitizedInput);
    await em.flush();
    res
      .status(200)
      .json({ message: "Carrera updated successfully", data: carrera });
  } catch (error: any) {
    if (error instanceof NotFoundError) {
      res.status(404).json({ message: "Resource not found" });
    } else {
      res.status(500).json({ message: "Internal server error" });
    }
  }
}

async function remove(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id);
    const carrera = await em.findOneOrFail(Carrera, { id });
    await em.removeAndFlush(carrera);
    res.status(200).json({ message: "Carrera deleted successfully" });
  } catch (error: any) {
    if (error instanceof NotFoundError) {
      res.status(404).json({ message: "Resource not found" });
    } else {
      res.status(500).json({ message: "Internal server error" });
    }
  }
}

export { findAll, findOne, add, update, remove, sanitizeCarrera };
