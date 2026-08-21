import { Request, Response, NextFunction } from "express";
import { Piloto } from "./piloto.entity.js";
import { orm } from "../shared/db/orm.js";
import { NotFoundError } from "@mikro-orm/core";
import { deleteFile, buildImageUrl, getRelativePath } from "../shared/upload/upload.utils.js";

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

// Helper: agrega URLs completas de imágenes a la respuesta
function addImageUrls(req: Request, piloto: any) {
  const data = typeof piloto.toJSON === "function" ? piloto.toJSON() : { ...piloto };
  data.profile_image_url = buildImageUrl(req, piloto.profile_image);
  return data;
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
    const data = pilotos.map((p) => addImageUrls(req, p));
    res.status(200).json({ message: "OK", data });
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
      { populate: ["team", "racing_series"] }
    );
    res.status(200).json({ message: "OK", data: addImageUrls(req, piloto) });
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
    // Si viene imagen en el POST multipart
    if (req.file) {
      req.body.sanitizedInput.profile_image = getRelativePath(req.file.path);
    }
    const piloto = em.create(Piloto, req.body.sanitizedInput);
    await em.flush();

    // Populate la escudería para mostrar información completa
    await em.populate(piloto, ["team", "racing_series"]);

    res.status(201).json({ message: "Created", data: addImageUrls(req, piloto) });
  } catch (error: any) {
    // Limpiar archivo subido si hay error
    if (req.file) await deleteFile(getRelativePath(req.file.path));
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
    // Si viene imagen en el PUT/PATCH multipart, eliminar la anterior
    if (req.file) {
      if (piloto.profile_image) await deleteFile(piloto.profile_image);
      req.body.sanitizedInput.profile_image = getRelativePath(req.file.path);
    }
    em.assign(piloto, req.body.sanitizedInput);
    await em.flush();
    res.status(200).json({ message: "Updated", data: addImageUrls(req, piloto) });
  } catch (error: any) {
    if (req.file) await deleteFile(getRelativePath(req.file.path));
    if (error instanceof NotFoundError) {
      res.status(404).json({ message: "Resource not found" });
    } else {
      res.status(500).json({ message: "Internal server error" });
    }
  }
}

// Upload de imagen de perfil dedicado
async function uploadProfileImage(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id);
    const piloto = await em.findOneOrFail(Piloto, { id });

    if (!req.file) {
      return res.status(400).json({ message: "No se proporcionó una imagen" });
    }

    // Si ya tenía imagen, eliminar la anterior del disco
    if (piloto.profile_image) await deleteFile(piloto.profile_image);
    piloto.profile_image = getRelativePath(req.file.path);
    await em.flush();

    res.status(200).json({ message: "Imagen actualizada", data: addImageUrls(req, piloto) });
  } catch (error: any) {
    if (req.file) await deleteFile(getRelativePath(req.file.path));
    if (error instanceof NotFoundError) {
      res.status(404).json({ message: "Resource not found" });
    } else {
      res.status(500).json({ message: "Internal server error" });
    }
  }
}

// Eliminar imagen de perfil sin borrar la entidad
async function deleteProfileImage(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id);
    const piloto = await em.findOneOrFail(Piloto, { id });

    if (!piloto.profile_image) {
      return res.status(404).json({ message: "El piloto no tiene imagen de perfil" });
    }

    await deleteFile(piloto.profile_image);
    piloto.profile_image = undefined;
    await em.flush();

    res.status(200).json({ message: "Imagen eliminada" });
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
    const piloto = await em.findOneOrFail(Piloto, { id });

    // Eliminar imágenes del disco antes de borrar la entidad
    if (piloto.profile_image) await deleteFile(piloto.profile_image);

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

export { findAll, findOne, add, update, remove, sanitizePiloto, uploadProfileImage, deleteProfileImage };
