import { Request, Response, NextFunction } from "express";
import { Piloto } from "./piloto.entity.js";
import { orm } from "../shared/db/orm.js";
import { NotFoundError } from "@mikro-orm/core";

const em = orm.em;

function sanitizePiloto(req: Request, res: Response, next: NextFunction) {
  //Response, Request y NextFunction son de express
  req.body.sanitizedInput = {
    name: req.body.name,
    team: req.body.team,
    num: req.body.num,
    nationality: req.body.nationality,
    birth_date: req.body.birth_date ? new Date(req.body.birth_date) : undefined,
    role: req.body.role,
    racing_series: req.body.racing_series,
    wdcs: req.body.wdcs,
    id: req.params.id,
  };
  Object.keys(req.body.sanitizedInput).forEach((key) => {
    //borra todos los atributos que no nos pasaron en el PATCH, evitamos errores
    if (req.body.sanitizedInput[key] === undefined) {
      delete req.body.sanitizedInput[key];
    }
  });
  next();
}

//get todos los pilotos
async function findAll(req: Request, res: Response) {
  try {
    const pilotos = await em.find(
      Piloto,
      {},
      {
        populate: ["team", "racing_series", "wdcs"],
      }
    );
    res.status(200).json({ message: "OK", data: pilotos });
  } catch (error: any) {
    res.status(500).json({ message: "Internal server error" });
  }
}

//get para un piloto en específico
async function findOne(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id);
    const piloto = await em.findOneOrFail(
      Piloto,
      { id },
      { populate: ["team"] }
    );
    res.status(200).json({ message: "OK", data: piloto });
  } catch (error: any) {
    if (error instanceof NotFoundError) {
      res.status(404).json({ message: "Resource not found" });
    } else {
      res.status(500).json({ message: "Internal server error" });
    }
  }
}

//post un nuevo piloto
async function add(req: Request, res: Response) {
  try {
    const piloto = em.create(Piloto, req.body.sanitizedInput);
    await em.flush();

    // Populate la escudería para mostrar información completa
    await em.populate(piloto, ["team", "racing_series"]);

    res.status(201).json({ message: "Created", data: piloto });
  } catch (error: any) {
    console.error("Error creating piloto:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
}

//put&patch de piloto
async function update(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id);
    const piloto = await em.findOneOrFail(Piloto, { id });
    em.assign(piloto, req.body.sanitizedInput);
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

async function remove(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id);
    const piloto = em.getReference(Piloto, id);
    await em.removeAndFlush(piloto);
    res.status(204).json({ message: "Deleted" });
  } catch (error: any) {
    if (error instanceof NotFoundError) {
      res.status(404).json({ message: "Resource not found" });
    } else {
      res.status(500).json({ message: "Internal server error" });
    }
  }
}

export { findAll, findOne, add, update, remove, sanitizePiloto };

//Nota para la posterioridad, dejo todos los catch iguales, esto es para que en un futuro encontrar una forma de que si no existe el objeto necesario, devuelva not found. Falta implementar.
