import { Categoria } from './categoria.entity.js';
import { NextFunction, Request, Response } from 'express';
import { orm } from '../shared/db/orm.js';
import {
  deleteFile,
  buildImageUrl,
  getRelativePath,
} from '../shared/upload/upload.utils.js';

const em = orm.em;

function sanitizeCategoriaInput(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  req.body.sanitizedInput = {
    name: req.body.name.toUpperCase(),
    description: req.body.description,
    teams: req.body.teams,
    drivers: req.body.drivers,
    seasons: req.body.seasons,
    id: req.params.id,
  };
  if (
    req.body.sanitizedInput.name !== 'F1' ||
    req.body.sanitizedInput.name !== 'F2'
  ) {
    return res
      .status(400)
      .json({ message: 'Categoria inválida, solo se permiten F1 y F2' });
  }
  Object.keys(req.body.sanitizedInput).forEach((key) => {
    if (req.body.sanitizedInput[key] === undefined) {
      delete req.body.sanitizedInput[key];
    }
  });
  next();
}

function addImageUrls(req: Request, categoria: Categoria) {
  const result = { ...categoria } as any;
  if (categoria.logo_image) {
    result.logo_image_url = buildImageUrl(req, categoria.logo_image);
  }
  return result;
}

async function uploadLogoImage(req: Request, res: Response) {
  /*
    #swagger.tags = ['Categorías']
    #swagger.summary = 'Subir logo de la categoría'
    #swagger.security = [{ "bearerAuth": [] }]
    #swagger.consumes = ['multipart/form-data']
    #swagger.parameters['image'] = { in: 'formData', type: 'file', required: true, description: 'Logo de la categoría' }
    #swagger.responses[200] = { 
      description: 'Logo subido',
      schema: { message: { type: 'string', example: 'Logo image uploaded successfully' }, data: { $ref: '#/components/schemas/Categoria' } }
    }
    #swagger.responses[400] = { description: 'Bad Request' }
    #swagger.responses[404] = { schema: { $ref: '#/components/schemas/NotFound' } }
    #swagger.responses[500] = { schema: { $ref: '#/components/schemas/ErrorServer' } }
  */
  try {
    const id = Number.parseInt(req.params.id);
    const categoria = await em.findOneOrFail(Categoria, { id });

    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }

    if (categoria.logo_image) {
      deleteFile(categoria.logo_image);
    }

    categoria.logo_image = getRelativePath(req.file.path);
    await em.flush();

    res.status(200).json({
      message: 'Logo image uploaded successfully',
      data: addImageUrls(req, categoria),
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

async function deleteLogoImage(req: Request, res: Response) {
  /*
    #swagger.tags = ['Categorías']
    #swagger.summary = 'Eliminar logo de la categoría'
    #swagger.security = [{ "bearerAuth": [] }]
    #swagger.responses[200] = { 
      description: 'Logo eliminado',
      schema: { message: { type: 'string', example: 'Logo image deleted successfully' }, data: { $ref: '#/components/schemas/Categoria' } }
    }
    #swagger.responses[404] = { schema: { $ref: '#/components/schemas/NotFound' } }
    #swagger.responses[500] = { schema: { $ref: '#/components/schemas/ErrorServer' } }
  */
  try {
    const id = Number.parseInt(req.params.id);
    const categoria = await em.findOneOrFail(Categoria, { id });

    if (categoria.logo_image) {
      deleteFile(categoria.logo_image);
      categoria.logo_image = undefined;
      await em.flush();
    }

    res.status(200).json({
      message: 'Logo image deleted successfully',
      data: addImageUrls(req, categoria),
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

//findALL
async function findAll(req: Request, res: Response) {
  /*
    #swagger.tags = ['Categorías']
    #swagger.summary = 'Obtener todas las categorías'
    #swagger.responses[200] = {
      description: 'OK',
      schema: { message: { type: 'string', example: 'findAll categorías:' }, data: [{ $ref: '#/components/schemas/Categoria' }] } 
    }
    #swagger.responses[404] = { schema: { $ref: '#/components/schemas/NotFound' } }
    #swagger.responses[500] = { schema: { $ref: '#/components/schemas/ErrorServer' } }
  */
  try {
    const categorias = await em.find(Categoria, {});
    const data = categorias.map((c) => addImageUrls(req, c));
    res.status(200).json({ message: 'findAll categorías:', data });
  } catch (error: any) {
    res.status(500).json({ message: 'Internal server error' });
  }
}

//findOne
async function findOne(req: Request, res: Response) {
  /*
    #swagger.tags = ['Categorías']
    #swagger.summary = 'Obtener una categoría por ID'
    #swagger.responses[200] = {
      description: 'OK',
      schema: { message: { type: 'string', example: 'OK' }, data: { $ref: '#/components/schemas/Categoria' } } 
    }
    #swagger.responses[404] = { schema: { $ref: '#/components/schemas/NotFound' } }
    #swagger.responses[500] = { schema: { $ref: '#/components/schemas/ErrorServer' } }
  */
  try {
    const id = Number.parseInt(req.params.id);
    const categoria = await em.findOneOrFail(Categoria, { id });
    res.status(200).json({ data: addImageUrls(req, categoria) });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

//add
async function add(req: Request, res: Response) {
  /*
    #swagger.tags = ['Categorías']
    #swagger.summary = 'Crear una nueva categoría'
    #swagger.security = [{ "bearerAuth": [] }]
    #swagger.parameters['body'] = {
      in: 'body',
      required: true,
      schema: { $ref: "#/components/schemas/CategoriaInput" }
    }
    #swagger.responses[201] = {
      description: 'Created',
      schema: { message: { type: 'string', example: 'categoria created succesfully' }, data: { $ref: '#/components/schemas/Categoria' } }
    }
    #swagger.responses[404] = { schema: { $ref: '#/components/schemas/NotFound' } }
    #swagger.responses[500] = { schema: { $ref: '#/components/schemas/ErrorServer' } }
  */
  try {
    const payload = req.body.sanitizedInput || req.body;
    if (req.file) {
      payload.logo_image = getRelativePath(req.file.path);
    }
    const categoria = em.create(Categoria, payload);
    await em.flush();
    res
      .status(201)
      .json({
        message: 'categoria created succesfully',
        data: addImageUrls(req, categoria),
      });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

//update
async function update(req: Request, res: Response) {
  /*
    #swagger.tags = ['Categorías']
    #swagger.summary = 'Actualizar una categoría'
    #swagger.security = [{ "bearerAuth": [] }]
    #swagger.parameters['body'] = {
      in: 'body',
      required: true,
      schema: { $ref: "#/components/schemas/CategoriaInput" }
    }
    #swagger.responses[200] = {
      description: 'Updated',
      schema: { message: { type: 'string', example: 'Updated succesfully' }, data: { $ref: '#/components/schemas/Categoria' } }
    }
    #swagger.responses[404] = { schema: { $ref: '#/components/schemas/NotFound' } }
    #swagger.responses[500] = { schema: { $ref: '#/components/schemas/ErrorServer' } }
  */
  try {
    const id = Number.parseInt(req.params.id);
    const categoria = await em.findOneOrFail(Categoria, { id });
    const payload = req.body.sanitizedInput || req.body;

    if (req.file) {
      if (categoria.logo_image) {
        deleteFile(categoria.logo_image);
      }
      payload.logo_image = getRelativePath(req.file.path);
    }

    em.assign(categoria, payload);
    await em.flush();
    res
      .status(200)
      .json({
        message: 'Updated succesfully',
        data: addImageUrls(req, categoria),
      });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

//delete
async function remove(req: Request, res: Response) {
  /*
    #swagger.tags = ['Categorías']
    #swagger.summary = 'Eliminar una categoría'
    #swagger.security = [{ "bearerAuth": [] }]
    #swagger.responses[200] = { 
      description: 'Deleted',
      schema: { message: { type: 'string', example: 'deleted succesfully' }, data: { $ref: '#/components/schemas/Categoria' } }
    }
    #swagger.responses[404] = { schema: { $ref: '#/components/schemas/NotFound' } }
    #swagger.responses[500] = { schema: { $ref: '#/components/schemas/ErrorServer' } }
  */
  try {
    const id = Number.parseInt(req.params.id);
    const categoria = await em.findOneOrFail(Categoria, { id });
    if (categoria.logo_image) {
      deleteFile(categoria.logo_image);
    }
    await em.removeAndFlush(categoria);
    res.status(200).json({ message: 'deleted succesfully', data: categoria });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

export {
  sanitizeCategoriaInput,
  findAll,
  findOne,
  add,
  update,
  remove,
  uploadLogoImage,
  deleteLogoImage,
};
