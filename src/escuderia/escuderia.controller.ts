import { Request, Response, NextFunction } from "express";
import { Escuderia } from "./escuderia.entity.js";
import { orm } from "../shared/db/orm.js";
import { NotFoundError } from "@mikro-orm/core";

const em = orm.em;

function sanitizeEscuderia(req: Request, res: Response, next: NextFunction) {
  req.body.sanitizedInput = {
    name: req.body.name,
    fundation: req.body.fundation,
    nationality: req.body.nationality,
    engine: req.body.engine,
    id: req.params.id,
    drivers: req.body.drivers,
    racing_series: req.body.racing_series,
    wccs: req.body.wccs,
    brand: req.body.brand ? Number(req.body.brand) : undefined,
  };
  Object.keys(req.body.sanitizedInput).forEach((key) => {
    if (req.body.sanitizedInput[key] === undefined) {
      delete req.body.sanitizedInput[key];
    }
  });
  next();
}

//GET ALL
async function findAll(req: Request, res: Response) {
  try {
    const escuderias = await em.find(
      Escuderia,
      {},
      { populate: ["drivers", "brand", "racing_series", "wccs"] }
    );
    res.status(200).json({ message: "OK", data: escuderias });
  } catch (error: any) {
    res.status(500).json({ message: "Internal server error" });
  }
}

//GET ONE
async function findOne(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id);
    const escuderia = await em.findOneOrFail(
      Escuderia,
      { id },
      { populate: ["drivers", "brand", "racing_series"] }
    );
    res.status(200).json({ message: "OK", data: escuderia });
  } catch (error: any) {
    if (error instanceof NotFoundError) {
      res.status(404).json({ message: "Resource not found" });
    } else {
      res.status(500).json({ message: "Internal server error" });
    }
  }
}

//POST
async function add(req: Request, res: Response) {
  try {
    const escuderia = em.create(Escuderia, req.body.sanitizedInput);
    await em.flush();

    await em.populate(escuderia, ["brand", "drivers"]);

    res.status(201).json({ message: "Created", data: escuderia });
  } catch (error: any) {
    console.error("Error creating escuderia:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
}

//PUT & PATCH
async function update(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id);
    const escuderia = await em.findOneOrFail(Escuderia, { id });
    em.assign(escuderia, req.body.sanitizedInput);
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

//DELETE
async function remove(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id);
    const escuderia = em.getReference(Escuderia, id);
    await em.removeAndFlush(escuderia);
    res.status(204).json({ message: "Deleted" });
  } catch (error: any) {
    if (error instanceof NotFoundError) {
      res.status(404).json({ message: "Resource not found" });
    } else {
      res.status(500).json({ message: "Internal server error" });
    }
  }
}

export { findAll, findOne, add, update, remove, sanitizeEscuderia };

//Nota para la posterioridad, dejo todos los catch iguales, esto es para que en un futuro encontrar una forma de que si no existe el objeto necesario, devuelva not found. Falta implementar.
