import { Request, Response, NextFunction } from "express";
import { Escuderia } from "./escuderia.entity.js";
import { orm } from "../shared/db/orm.js";
import { NotFoundError } from "@mikro-orm/core";
import {
  deleteFile,
  buildImageUrl,
  getRelativePath,
} from "../shared/upload/upload.utils.js";

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
    color: req.body.color,
    desc: req.body.desc,
  };
  Object.keys(req.body.sanitizedInput).forEach((key) => {
    if (req.body.sanitizedInput[key] === undefined) {
      delete req.body.sanitizedInput[key];
    }
  });
  next();
}

function addImageUrls(req: Request, escuderia: Escuderia) {
  return {
    ...escuderia,
    logo_image_url: buildImageUrl(req, escuderia.logo_image),
    car_image_url: buildImageUrl(req, escuderia.car_image),
  };
}

async function uploadLogoImage(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id);
    const escuderia = await em.findOneOrFail(Escuderia, { id });

    if (!req.file) {
      return res.status(400).json({ message: "No image provided" });
    }

    const oldImage = escuderia.logo_image;
    escuderia.logo_image = getRelativePath(req.file.path);
    await em.flush();

    if (oldImage) {
      deleteFile(oldImage);
    }

    res.status(200).json({
      message: "Logo image uploaded successfully",
      data: addImageUrls(req, escuderia),
    });
  } catch (error: any) {
    if (req.file) {
      deleteFile(req.file.path);
    }
    if (error instanceof NotFoundError) {
      res.status(404).json({ message: "Resource not found" });
    } else {
      res.status(500).json({ message: "Internal server error" });
    }
  }
}

async function deleteLogoImage(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id);
    const escuderia = await em.findOneOrFail(Escuderia, { id });

    if (escuderia.logo_image) {
      const oldImage = escuderia.logo_image;
      escuderia.logo_image = undefined;
      await em.flush();
      deleteFile(oldImage);
    }

    res.status(200).json({
      message: "Logo image deleted successfully",
      data: addImageUrls(req, escuderia),
    });
  } catch (error: any) {
    if (error instanceof NotFoundError) {
      res.status(404).json({ message: "Resource not found" });
    } else {
      res.status(500).json({ message: "Internal server error" });
    }
  }
}

async function uploadCarImage(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id);
    const escuderia = await em.findOneOrFail(Escuderia, { id });

    if (!req.file) {
      return res.status(400).json({ message: "No image provided" });
    }

    const oldImage = escuderia.car_image;
    escuderia.car_image = getRelativePath(req.file.path);
    await em.flush();

    if (oldImage) {
      deleteFile(oldImage);
    }

    res.status(200).json({
      message: "Car image uploaded successfully",
      data: addImageUrls(req, escuderia),
    });
  } catch (error: any) {
    if (req.file) {
      deleteFile(req.file.path);
    }
    if (error instanceof NotFoundError) {
      res.status(404).json({ message: "Resource not found" });
    } else {
      res.status(500).json({ message: "Internal server error" });
    }
  }
}

async function deleteCarImage(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id);
    const escuderia = await em.findOneOrFail(Escuderia, { id });

    if (escuderia.car_image) {
      const oldImage = escuderia.car_image;
      escuderia.car_image = undefined;
      await em.flush();
      deleteFile(oldImage);
    }

    res.status(200).json({
      message: "Car image deleted successfully",
      data: addImageUrls(req, escuderia),
    });
  } catch (error: any) {
    if (error instanceof NotFoundError) {
      res.status(404).json({ message: "Resource not found" });
    } else {
      res.status(500).json({ message: "Internal server error" });
    }
  }
}

//GET ALL
async function findAll(req: Request, res: Response) {
  try {
    const escuderias = await em.find(
      Escuderia,
      {},
      { populate: ["drivers", "brand", "racing_series", "wccs"] },
    );
    const escuderiasWithUrls = escuderias.map((escuderia) =>
      addImageUrls(req, escuderia),
    );
    res.status(200).json({ message: "OK", data: escuderiasWithUrls });
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
      { populate: ["drivers", "brand", "racing_series"] },
    );
    res.status(200).json({ message: "OK", data: addImageUrls(req, escuderia) });
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
    if (req.file) {
      req.body.sanitizedInput.logo_image = getRelativePath(req.file.path);
    }
    const escuderia = em.create(Escuderia, req.body.sanitizedInput);
    await em.flush();

    await em.populate(escuderia, ["brand", "drivers"]);

    res
      .status(201)
      .json({ message: "Created", data: addImageUrls(req, escuderia) });
  } catch (error: any) {
    if (req.file) {
      deleteFile(req.file.path);
    }
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

    let oldLogoImage: string | undefined;
    if (req.file) {
      oldLogoImage = escuderia.logo_image;
      req.body.sanitizedInput.logo_image = getRelativePath(req.file.path);
    }

    em.assign(escuderia, req.body.sanitizedInput);
    await em.flush();

    if (oldLogoImage && oldLogoImage !== escuderia.logo_image) {
      deleteFile(oldLogoImage);
    }

    res.status(204).json({ message: "Updated" });
  } catch (error: any) {
    if (req.file) {
      deleteFile(req.file.path);
    }
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
    const escuderia = await em.findOneOrFail(Escuderia, { id });
    const imageToDelete = escuderia.logo_image;
    const imageToDelete2 = escuderia.car_image;

    await em.removeAndFlush(escuderia);

    if (imageToDelete) {
      deleteFile(imageToDelete);
    }
    if (imageToDelete2) {
      deleteFile(imageToDelete2);
    }
    res.status(204).json({ message: "Deleted" });
  } catch (error: any) {
    if (error instanceof NotFoundError) {
      res.status(404).json({ message: "Resource not found" });
    } else {
      res.status(500).json({ message: "Internal server error" });
    }
  }
}

export {
  findAll,
  findOne,
  add,
  update,
  remove,
  sanitizeEscuderia,
  uploadLogoImage,
  deleteLogoImage,
  uploadCarImage,
  deleteCarImage,
};

//Nota para la posterioridad, dejo todos los catch iguales, esto es para que en un futuro encontrar una forma de que si no existe el objeto necesario, devuelva not found. Falta implementar.
