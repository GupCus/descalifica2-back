import { Request, Response, NextFunction } from 'express';
import { Usuario } from './usuario.entity.js';
import { orm } from '../shared/db/orm.js';
import { NotFoundError } from '@mikro-orm/core';
import {
  deleteFile,
  buildImageUrl,
  getRelativePath,
} from '../shared/upload/upload.utils.js';

const em = orm.em;

function sanitizeUsuario(req: Request, res: Response, next: NextFunction) {
  req.body.sanitizedInput = {
    username: req.body.username,
    password: req.body.password,
    name: req.body.name,
    surname: req.body.surname,
    email: req.body.email,
    date_of_birth: req.body.date_of_birth,
    fav_driver: req.body.fav_driver,
    fav_team: req.body.fav_team,
    fav_circuit: req.body.fav_circuit,
    bio: req.body.bio,
    id: req.params.id,
    user_type: req.body.user_type,
  };
  Object.keys(req.body.sanitizedInput).forEach((key) => {
    if (req.body.sanitizedInput[key] === undefined) {
      delete req.body.sanitizedInput[key];
    }
  });

  if (req.file) {
    req.body.sanitizedInput.avatar = getRelativePath(req.file.path);
  }

  next();
}

function addImageUrls(req: Request, usuario: Usuario) {
  const result = { ...usuario } as any;
  if (usuario.avatar) {
    result.avatar_url = buildImageUrl(req, usuario.avatar);
  }
  return result;
}

async function uploadAvatar(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id);
    const usuario = await em.findOneOrFail(Usuario, { id });

    if (!req.file) {
      return res.status(400).json({ message: 'Image is required' });
    }

    if (usuario.avatar) {
      deleteFile(usuario.avatar);
    }

    usuario.avatar = getRelativePath(req.file.path);
    await em.flush();

    res
      .status(200)
      .json({ message: 'Avatar uploaded', data: addImageUrls(req, usuario) });
  } catch (error: any) {
    if (error instanceof NotFoundError) {
      res.status(404).json({ message: 'Resource not found' });
    } else {
      res.status(500).json({ message: 'Internal server error' });
    }
  }
}

async function deleteAvatar(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id);
    const usuario = await em.findOneOrFail(Usuario, { id });

    if (usuario.avatar) {
      deleteFile(usuario.avatar);
      usuario.avatar = undefined;
      await em.flush();
    }

    res
      .status(200)
      .json({ message: 'Avatar deleted', data: addImageUrls(req, usuario) });
  } catch (error: any) {
    if (error instanceof NotFoundError) {
      res.status(404).json({ message: 'Resource not found' });
    } else {
      res.status(500).json({ message: 'Internal server error' });
    }
  }
}

// obtener todos los usuarios
async function findAll(req: Request, res: Response) {
  try {
    const usuarios = await em.find(Usuario, {});
    const usuariosWithUrls = usuarios.map((u) => addImageUrls(req, u));
    res.status(200).json({ message: 'OK', data: usuariosWithUrls });
  } catch (error: any) {
    res.status(500).json({ message: 'Internal server error' });
  }
}

// Obtener un usuario por ID

async function findOne(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id);
    const usuario = await em.findOneOrFail(Usuario, { id });
    res.status(200).json({ message: 'OK', data: addImageUrls(req, usuario) });
  } catch (error: any) {
    if (error instanceof NotFoundError) {
      res.status(404).json({ message: 'Resource not found' });
    } else {
      res.status(500).json({ message: 'Internal server error' });
    }
  }
}

//Actualizar un usuario existente

async function update(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id);
    const usuario = await em.findOneOrFail(Usuario, { id });

    // Si hay archivo, agregar la ruta al objeto sanitizado
    if (req.file) {
      if (usuario.avatar) {
        deleteFile(usuario.avatar);
      }
      req.body.sanitizedInput.avatar = getRelativePath(req.file.path);
    }

    em.assign(usuario, req.body.sanitizedInput);
    await em.flush();
    res.status(204).json({ message: 'Updated' });
  } catch (error: any) {
    if (error instanceof NotFoundError) {
      res.status(404).json({ message: 'Resource not found' });
    } else {
      res.status(500).json({ message: 'Internal server error' });
    }
  }
}

//Eliminar un usuario

async function remove(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id);
    const usuario = await em.findOneOrFail(Usuario, { id });

    if (usuario.avatar) {
      deleteFile(usuario.avatar);
    }

    await em.removeAndFlush(usuario);
    res.status(204).json({ message: 'Deleted' });
  } catch (error: any) {
    if (error instanceof NotFoundError) {
      res.status(404).json({ message: 'Resource not found' });
    } else {
      res.status(500).json({ message: 'Internal server error' });
    }
  }
}

export {
  sanitizeUsuario,
  findAll,
  findOne,
  update,
  remove,
  uploadAvatar,
  deleteAvatar,
};
