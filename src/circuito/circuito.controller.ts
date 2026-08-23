import { Request, Response, NextFunction } from 'express';
import { Circuito } from './circuito.entity.js';
import { orm } from '../shared/db/orm.js';
import { NotFoundError } from '@mikro-orm/core';
import {
  deleteFile,
  buildImageUrl,
  getRelativePath,
} from '../shared/upload/upload.utils.js';

const em = orm.em;

function sanitizeCircuitoInput(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  req.body.sanitizedInput = {
    name: req.body.name,
    country: req.body.country,
    length: req.body.length,
    year: req.body.year,
    id: req.body.id,
    track_map_image: req.body.track_map_image,
  };

  Object.keys(req.body.sanitizedInput).forEach((key) => {
    if (req.body.sanitizedInput[key] === undefined) {
      delete req.body.sanitizedInput[key];
    }
  });
  next();
}

function addImageUrls(req: Request, circuito: Circuito) {
  const data = { ...circuito } as any;
  if (circuito.track_map_image) {
    data.track_map_image_url = buildImageUrl(req, circuito.track_map_image);
  }
  if (circuito.photo_image) {
    data.photo_image_url = buildImageUrl(req, circuito.photo_image);
  }
  return data;
}

async function uploadTrackMap(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id);
    const circuito = await em.findOneOrFail(Circuito, { id });

    if (circuito.track_map_image) {
      deleteFile(circuito.track_map_image);
    }

    if (req.file) {
      circuito.track_map_image = getRelativePath(req.file.path);
    }

    await em.flush();
    res.status(200).json({
      message: 'Track map uploaded successfully',
      data: addImageUrls(req, circuito),
    });
  } catch (error: any) {
    if (error instanceof NotFoundError) {
      res.status(404).json({ message: 'Resource not found' });
    } else {
      res.status(500).json({ message: 'Internal server error' });
    }
  }
}

async function deleteTrackMap(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id);
    const circuito = await em.findOneOrFail(Circuito, { id });

    if (circuito.track_map_image) {
      deleteFile(circuito.track_map_image);
      circuito.track_map_image = undefined;
      await em.flush();
    }

    res.status(200).json({
      message: 'Track map deleted successfully',
      data: addImageUrls(req, circuito),
    });
  } catch (error: any) {
    if (error instanceof NotFoundError) {
      res.status(404).json({ message: 'Resource not found' });
    } else {
      res.status(500).json({ message: 'Internal server error' });
    }
  }
}

async function uploadPhotoImage(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id);
    const circuito = await em.findOneOrFail(Circuito, { id });

    if (circuito.photo_image) {
      deleteFile(circuito.photo_image);
    }

    if (req.file) {
      circuito.photo_image = getRelativePath(req.file.path);
    }

    await em.flush();
    res.status(200).json({
      message: 'Photo image uploaded successfully',
      data: addImageUrls(req, circuito),
    });
  } catch (error: any) {
    if (error instanceof NotFoundError) {
      res.status(404).json({ message: 'Resource not found' });
    } else {
      res.status(500).json({ message: 'Internal server error' });
    }
  }
}

async function deletePhotoImage(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id);
    const circuito = await em.findOneOrFail(Circuito, { id });

    if (circuito.photo_image) {
      deleteFile(circuito.photo_image);
      circuito.photo_image = undefined;
      await em.flush();
    }

    res.status(200).json({
      message: 'Photo image deleted successfully',
      data: addImageUrls(req, circuito),
    });
  } catch (error: any) {
    if (error instanceof NotFoundError) {
      res.status(404).json({ message: 'Resource not found' });
    } else {
      res.status(500).json({ message: 'Internal server error' });
    }
  }
}

//get todos los Circuitos
async function findAll(req: Request, res: Response) {
  try {
    const circuitos = await em.find(Circuito, {});
    const data = circuitos.map((circuito) => addImageUrls(req, circuito));
    res.status(200).json({ message: 'OK', data });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

//get para un Circuito en específico
async function findOne(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id);
    const circuito = await em.findOneOrFail(Circuito, { id });
    res.status(200).json({ message: 'OK', data: addImageUrls(req, circuito) });
  } catch (error: any) {
    if (error instanceof NotFoundError) {
      res.status(404).json({ message: 'Resource not found' });
    } else {
      res.status(500).json({ message: 'Internal server error' });
    }
  }
}

//post un nuevo Circuito
async function add(req: Request, res: Response) {
  try {
    const circuito = em.create(Circuito, req.body.sanitizedInput);
    if (req.file) {
      circuito.track_map_image = getRelativePath(req.file.path);
    }
    await em.flush();
    res
      .status(201)
      .json({
        message: 'Circuito created successfully',
        data: addImageUrls(req, circuito),
      });
  } catch (error: any) {
    console.error('Error creating circuito: ', error);
    res.status(500).json({ message: error.message });
  }
}

//put&patch de Circuito

async function update(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id);
    const circuito = await em.findOneOrFail(Circuito, { id });

    if (req.file) {
      if (circuito.track_map_image) {
        deleteFile(circuito.track_map_image);
      }
      req.body.sanitizedInput.track_map_image = getRelativePath(req.file.path);
    }

    em.assign(circuito, req.body.sanitizedInput);
    await em.flush();
    res
      .status(200)
      .json({
        message: 'Circuito updated successfully',
        data: addImageUrls(req, circuito),
      });
  } catch (error: any) {
    if (error instanceof NotFoundError) {
      res.status(404).json({ message: 'Resource not found' });
    } else {
      res.status(500).json({ message: 'Internal server error' });
    }
  }
}

//Aunque este definida en el repository con un parametro {id: string} de esta forma tenemos la versatilidad de que manden tanto asi como el character entero
async function remove(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id);
    const circuito = await em.findOneOrFail(Circuito, { id });
    if (circuito.track_map_image) deleteFile(circuito.track_map_image);
    if (circuito.photo_image) deleteFile(circuito.photo_image);
    await em.removeAndFlush(circuito);
    res.status(200).json({ message: 'Circuito deleted successfully' });
  } catch (error: any) {
    if (error instanceof NotFoundError) {
      res.status(404).json({ message: 'Resource not found' });
    } else {
      res.status(500).json({ message: 'Internal server error' });
    }
  }
}

export {
  findAll,
  findOne,
  add,
  update,
  remove,
  sanitizeCircuitoInput,
  uploadTrackMap,
  deleteTrackMap,
  uploadPhotoImage,
  deletePhotoImage,
};
