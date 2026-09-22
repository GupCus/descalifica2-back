import { Request, Response, NextFunction } from "express";
import { Marca } from "./marca.entity.js";
import { orm } from "../shared/db/orm.js";
import { NotFoundError } from "@mikro-orm/core";
import { deleteFile, buildImageUrl, getRelativePath } from "../shared/upload/upload.utils.js";

const em = orm.em;

function addImageUrls(marca: Marca, req: Request): any {
  const marcaData = { ...marca };
  if (marca.logo_image) {
    (marcaData as any).logo_image_url = buildImageUrl(req, marca.logo_image);
  }
  return marcaData;
}

function sanitizeMarca(req: Request, res: Response, next: NextFunction) {
  req.body.sanitizedInput = {
    name: req.body.name,
    id: req.params.id,
    nationality: req.body.nationality,
    foundation: req.body.foundation,
    description: req.body.description,
    // ¿Mostramos teams de c/ marca??
  };
  Object.keys(req.body.sanitizedInput).forEach((key) => {
    if (req.body.sanitizedInput[key] === undefined) {
      delete req.body.sanitizedInput[key];
    }
  });
  next();
}

//Traer todas las marcas
async function findAll(req: Request, res: Response) {
  /*
    #swagger.tags = ['Marcas']
    #swagger.summary = 'Obtener todas las marcas'
    #swagger.responses[200] = {
      description: 'OK',
      schema: { message: { type: 'string', example: 'OK' }, data: [{ $ref: '#/components/schemas/Marca' }] }
    }
    #swagger.responses[404] = { schema: { $ref: '#/components/schemas/NotFound' } }
    #swagger.responses[500] = { schema: { $ref: '#/components/schemas/ErrorServer' } }
  */
  try {
    const marcas = await em.find(Marca, {}, { populate: ["teams"] });
    const marcasWithUrls = marcas.map((m) => addImageUrls(m, req));
    res.status(200).json({ message: "OK", data: marcasWithUrls });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

async function findOne(req: Request, res: Response) {
  /*
    #swagger.tags = ['Marcas']
    #swagger.summary = 'Obtener una marca por ID'
    #swagger.responses[200] = {
      description: 'OK',
      schema: { message: { type: 'string', example: 'OK' }, data: { $ref: '#/components/schemas/Marca' } }
    }
    #swagger.responses[404] = { schema: { $ref: '#/components/schemas/NotFound' } }
    #swagger.responses[500] = { schema: { $ref: '#/components/schemas/ErrorServer' } }
  */
  try {
    const id = Number.parseInt(req.params.id);
    console.log("Buscando marca con ID:", id);

    // Validar que el ID sea un número válido
    if (isNaN(id)) {
      return res.status(400).json({ message: "ID debe ser un número válido" });
    }

    const marca = await em.findOneOrFail(
      Marca,
      { id },
      { populate: ["teams"] }
    );
    console.log("Marca encontrada:", marca);
    res.status(200).json({ message: "OK", data: addImageUrls(marca, req) });
  } catch (error: any) {
    console.error("Error en findOne:", error);
    if (error instanceof NotFoundError) {
      res.status(404).json({ message: "Resource not found" });
    } else {
      res.status(500).json({ message: "Internal server error" });
    }
  }
}

async function add(req: Request, res: Response) {
  /*
    #swagger.tags = ['Marcas']
    #swagger.summary = 'Crear una nueva marca'
    #swagger.security = [{ "bearerAuth": [] }]
    #swagger.parameters['body'] = {
      in: 'body',
      required: true,
      schema: { $ref: "#/components/schemas/MarcaInput" }
    }
    #swagger.responses[201] = {
      description: 'Marca created successfully',
      schema: { message: { type: 'string', example: 'Marca created successfully' }, data: { $ref: '#/components/schemas/Marca' } }
    }
    #swagger.responses[404] = { schema: { $ref: '#/components/schemas/NotFound' } }
    #swagger.responses[500] = { schema: { $ref: '#/components/schemas/ErrorServer' } }
  */
  try {
    const data = req.body.sanitizedInput;
    if (req.file) {
      data.logo_image = getRelativePath(req.file.path);
    }
    const marca = em.create(Marca, data);
    await em.flush();
    res
      .status(201)
      .json({ message: "Marca created successfully", data: addImageUrls(marca, req) });
  } catch (error: any) {
    console.error("Error creating marca:", error);
    res.status(500).json({ message: error.message });
  }
}

async function update(req: Request, res: Response) {
  /*
    #swagger.tags = ['Marcas']
    #swagger.summary = 'Actualizar una marca'
    #swagger.security = [{ "bearerAuth": [] }]
    #swagger.parameters['body'] = {
      in: 'body',
      required: true,
      schema: { $ref: "#/components/schemas/MarcaInput" }
    }
    #swagger.responses[200] = {
      description: 'Marca updated successfully',
      schema: { message: { type: 'string', example: 'Marca updated successfully' }, data: { $ref: '#/components/schemas/Marca' } }
    }
    #swagger.responses[404] = { schema: { $ref: '#/components/schemas/NotFound' } }
    #swagger.responses[500] = { schema: { $ref: '#/components/schemas/ErrorServer' } }
  */
  try {
    const id = Number.parseInt(req.params.id);
    const marca = await em.findOneOrFail(Marca, { id });
    const data = req.body.sanitizedInput;
    if (req.file) {
      if (marca.logo_image) {
        deleteFile(marca.logo_image);
      }
      data.logo_image = getRelativePath(req.file.path);
    }
    em.assign(marca, data);
    await em.flush();
    res
      .status(200)
      .json({ message: "Marca updated successfully", data: addImageUrls(marca, req) });
  } catch (error: any) {
    if (error instanceof NotFoundError) {
      res.status(404).json({ message: "Resource not found" });
    } else {
      res.status(500).json({ message: "Internal server error" });
    }
  }
}

async function remove(req: Request, res: Response) {
  /*
    #swagger.tags = ['Marcas']
    #swagger.summary = 'Eliminar una marca'
    #swagger.security = [{ "bearerAuth": [] }]
    #swagger.responses[200] = { 
      description: 'Deleted',
      schema: { message: { type: 'string', example: 'Marca deleted successfully' } }
    }
    #swagger.responses[404] = { schema: { $ref: '#/components/schemas/NotFound' } }
    #swagger.responses[500] = { schema: { $ref: '#/components/schemas/ErrorServer' } }
  */
  try {
    const id = Number.parseInt(req.params.id);
    const marca = await em.findOneOrFail(Marca, { id });
    if (marca.logo_image) {
      deleteFile(marca.logo_image);
    }
    await em.removeAndFlush(marca);
    res.status(200).json({ message: "Marca deleted successfully" });
  } catch (error: any) {
    if (error instanceof NotFoundError) {
      res.status(404).json({ message: "Resource not found" });
    } else {
      res.status(500).json({ message: "Internal server error" });
    }
  }
}

async function uploadLogoImage(req: Request, res: Response) {
  /*
    #swagger.tags = ['Marcas']
    #swagger.summary = 'Subir logo de la marca'
    #swagger.security = [{ "bearerAuth": [] }]
    #swagger.consumes = ['multipart/form-data']
    #swagger.parameters['image'] = { in: 'formData', type: 'file', required: true, description: 'Logo de la marca' }
    #swagger.responses[200] = { 
      description: 'Logo subido',
      schema: { message: { type: 'string', example: 'Logo image uploaded successfully' }, data: { $ref: '#/components/schemas/Marca' } }
    }
    #swagger.responses[400] = { description: 'Bad Request' }
    #swagger.responses[404] = { schema: { $ref: '#/components/schemas/NotFound' } }
    #swagger.responses[500] = { schema: { $ref: '#/components/schemas/ErrorServer' } }
  */
  try {
    const id = Number.parseInt(req.params.id);
    const marca = await em.findOneOrFail(Marca, { id });

    if (!req.file) {
      return res.status(400).json({ message: "No image file provided" });
    }

    if (marca.logo_image) {
      deleteFile(marca.logo_image);
    }

    marca.logo_image = getRelativePath(req.file.path);
    await em.flush();

    res.status(200).json({
      message: "Logo image uploaded successfully",
      data: addImageUrls(marca, req),
    });
  } catch (error: any) {
    if (error instanceof NotFoundError) {
      res.status(404).json({ message: "Resource not found" });
    } else {
      res.status(500).json({ message: "Internal server error" });
    }
  }
}

async function deleteLogoImage(req: Request, res: Response) {
  /*
    #swagger.tags = ['Marcas']
    #swagger.summary = 'Eliminar logo de la marca'
    #swagger.security = [{ "bearerAuth": [] }]
    #swagger.responses[200] = { 
      description: 'Logo eliminado',
      schema: { message: { type: 'string', example: 'Logo image deleted successfully' }, data: { $ref: '#/components/schemas/Marca' } }
    }
    #swagger.responses[404] = { schema: { $ref: '#/components/schemas/NotFound' } }
    #swagger.responses[500] = { schema: { $ref: '#/components/schemas/ErrorServer' } }
  */
  try {
    const id = Number.parseInt(req.params.id);
    const marca = await em.findOneOrFail(Marca, { id });

    if (marca.logo_image) {
      deleteFile(marca.logo_image);
      marca.logo_image = undefined;
      await em.flush();
    }

    res.status(200).json({
      message: "Logo image deleted successfully",
      data: addImageUrls(marca, req),
    });
  } catch (error: any) {
    if (error instanceof NotFoundError) {
      res.status(404).json({ message: "Resource not found" });
    } else {
      res.status(500).json({ message: "Internal server error" });
    }
  }
}

export { findAll, findOne, add, update, remove, sanitizeMarca, uploadLogoImage, deleteLogoImage };
