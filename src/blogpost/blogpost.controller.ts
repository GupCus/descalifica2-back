import { Request, Response, NextFunction } from 'express';
import { Blogpost } from './blogpost.entity.js';
import { Usuario } from '../usuario/usuario.entity.js';
import { orm } from '../shared/db/orm.js';
import { NotFoundError } from '@mikro-orm/core';
import {
  deleteFile,
  buildImageUrl,
  getRelativePath,
} from '../shared/upload/upload.utils.js';

function sanitizeBlogpost(req: Request, res: Response, next: NextFunction) {
  // Parsear tags: puede venir como string JSON (form-data/multer) o como array (JSON)
  let tags = req.body.tags;
  if (typeof tags === 'string') {
    try {
      tags = JSON.parse(tags);
    } catch {
      tags = undefined;
    }
  }
  if (Array.isArray(tags)) {
    tags = tags
      .map((t: string) => String(t).trim().toLowerCase())
      .filter((t: string) => t.length > 0);
  } else {
    tags = undefined;
  }

  req.body.sanitizedInput = {
    title: req.body.title,
    content: req.body.content,
    author: req.body.authorID ? Number(req.body.authorID) : undefined,
    created_at: Date.now(),
    tags,
    id: req.params.id,
  };
  Object.keys(req.body.sanitizedInput).forEach((key) => {
    if (req.body.sanitizedInput[key] === undefined) {
      delete req.body.sanitizedInput[key];
    }
  });
  next();
}

function addImageUrls(req: Request, blogpost: Blogpost) {
  const result: any = { ...blogpost };
  if (blogpost.cover_image) {
    result.cover_image_url = buildImageUrl(req, blogpost.cover_image);
  }
  return result;
}

// obtener todos los blogposts

async function findAll(req: Request, res: Response) {
  try {
    const em = orm.em.fork();
    const blogposts = await em.find(Blogpost, {});
    const data = blogposts.map((b) => addImageUrls(req, b));
    res.status(200).json({ message: 'OK', data });
  } catch (error: any) {
    res.status(500).json({ message: 'Internal server error' });
  }
}

// Obtener un blogpost por ID

async function findOne(req: Request, res: Response) {
  try {
    const em = orm.em.fork();
    const id = Number.parseInt(req.params.id);
    const blogpost = await em.findOneOrFail(Blogpost, { id });
    res.status(200).json({ message: 'OK', data: addImageUrls(req, blogpost) });
  } catch (error: any) {
    if (error instanceof NotFoundError) {
      res.status(404).json({ message: 'Resource not found' });
    } else {
      res.status(500).json({ message: 'Internal server error' });
    }
  }
}

//Crear un nuevo blogpost

async function add(req: Request, res: Response) {
  try {
    const em = orm.em.fork();
    if (req.file) {
      req.body.sanitizedInput.cover_image = getRelativePath(req.file.path);
    }
    const blogpost = em.create(Blogpost, req.body.sanitizedInput);
    await em.flush();
    res
      .status(201)
      .json({ message: 'Resource created', data: addImageUrls(req, blogpost) });
  } catch (error: any) {
    console.error('Error creating blogpost:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

//Actualizar un blogpost

async function update(req: Request, res: Response) {
  try {
    const em = orm.em.fork();
    const id = Number.parseInt(req.params.id);
    const blogpost = await em.findOneOrFail(Blogpost, { id });
    if (req.file) {
      req.body.sanitizedInput.cover_image = getRelativePath(req.file.path);
      if (blogpost.cover_image) {
        deleteFile(blogpost.cover_image);
      }
    }
    em.assign(blogpost, req.body.sanitizedInput);
    await em.flush();
    res
      .status(200)
      .json({ message: 'Resource updated', data: addImageUrls(req, blogpost) });
  } catch (error: any) {
    if (error instanceof NotFoundError) {
      res.status(404).json({ message: 'Resource not found' });
    } else {
      res.status(500).json({ message: 'Internal server error' });
    }
  }
}

//Eliminar un blogpost

async function remove(req: Request, res: Response) {
  try {
    const em = orm.em.fork();
    const id = Number.parseInt(req.params.id);
    const blogpost = await em.findOneOrFail(
      Blogpost,
      { id },
      { populate: ['comentarios'] },
    );
    if (blogpost.cover_image) {
      deleteFile(blogpost.cover_image);
    }
    await em.remove(blogpost).flush();
    res.status(200).json({ message: 'Resource deleted' });
  } catch (error: any) {
    if (error instanceof NotFoundError) {
      res.status(404).json({ message: 'Resource not found' });
    } else {
      res.status(500).json({ message: 'Internal server error' });
    }
  }
}

async function uploadCoverImage(req: Request, res: Response) {
  try {
    const em = orm.em.fork();
    const id = Number.parseInt(req.params.id);
    const blogpost = await em.findOneOrFail(Blogpost, { id });

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    if (blogpost.cover_image) {
      deleteFile(blogpost.cover_image);
    }

    blogpost.cover_image = getRelativePath(req.file.path);
    await em.flush();

    res.status(200).json({
      message: 'Cover image uploaded successfully',
      data: addImageUrls(req, blogpost),
    });
  } catch (error: any) {
    if (error instanceof NotFoundError) {
      res.status(404).json({ message: 'Resource not found' });
    } else {
      res.status(500).json({ message: 'Internal server error' });
    }
  }
}

async function deleteCoverImage(req: Request, res: Response) {
  try {
    const em = orm.em.fork();
    const id = Number.parseInt(req.params.id);
    const blogpost = await em.findOneOrFail(Blogpost, { id });

    if (blogpost.cover_image) {
      deleteFile(blogpost.cover_image);
      blogpost.cover_image = undefined;
      await em.flush();
    }

    res.status(200).json({
      message: 'Cover image deleted successfully',
      data: addImageUrls(req, blogpost),
    });
  } catch (error: any) {
    if (error instanceof NotFoundError) {
      res.status(404).json({ message: 'Resource not found' });
    } else {
      res.status(500).json({ message: 'Internal server error' });
    }
  }
}

async function findSuggested(req: Request, res: Response) {
  try {
    const em = orm.em.fork();
    const userId = Number.parseInt(req.params.userId);
    const usuario = await em.findOneOrFail(Usuario, { id: userId });

    const userInterests: string[] = [
      usuario.fav_driver,
      usuario.fav_team,
      usuario.fav_circuit,
    ]
      .filter((v): v is string => !!v)
      .map((v) => v.trim().toLowerCase());

    if (userInterests.length === 0) {
      return res.status(200).json({ message: 'OK', data: [] });
    }

    const blogposts = await em.find(Blogpost, { tags: { $ne: null } });

    const scored = blogposts
      .map((bp) => {
        const matches = (bp.tags ?? []).filter((tag) =>
          userInterests.includes(tag),
        ).length;
        return { blogpost: bp, matches };
      })
      .filter((item) => item.matches > 0)
      .sort((a, b) => {
        if (b.matches !== a.matches) return b.matches - a.matches;
        return (
          b.blogpost.created_at.getTime() - a.blogpost.created_at.getTime()
        );
      });

    const data = scored.map((item) => ({
      ...addImageUrls(req, item.blogpost),
      relevance: item.matches,
    }));

    res.status(200).json({ message: 'OK', data });
  } catch (error: any) {
    if (error instanceof NotFoundError) {
      res.status(404).json({ message: 'User not found' });
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
  sanitizeBlogpost,
  uploadCoverImage,
  deleteCoverImage,
  findSuggested,
};
