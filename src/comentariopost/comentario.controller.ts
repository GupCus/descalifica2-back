import { Request, Response, NextFunction } from 'express';
import { ComentarioPost } from './comentario.entity.js';
import { orm } from '../shared/db/orm.js';
import { NotFoundError } from '@mikro-orm/core';


function sanitizeComentario(req: Request, res: Response, next: NextFunction) {
  req.body.sanitizedInput = {
    id: req.params.id,
    content: req.body.content,
    createdAt: Date.now(),
    author: req.body.author,
    blogpost: req.body.blogpost,
  };
  Object.keys(req.body.sanitizedInput).forEach((key) => {
    if (req.body.sanitizedInput[key] === undefined) {
      delete req.body.sanitizedInput[key];
    }
  });
  next();
}

async function findAll(req: Request, res: Response) {
  try {
    const em = orm.em.fork();
    const comentarios = await em.find(ComentarioPost, {});
    res.status(200).json({ message: 'OK', data: comentarios });
  } catch (error: any) {
    res.status(500).json({ message: 'Internal server error' });
  }
}

async function findOne(req: Request, res: Response) {
  try {
    const em = orm.em.fork();
    const id = Number.parseInt(req.params.id);
    const comentario = await em.findOneOrFail(ComentarioPost, { id });
    res.status(200).json({ message: 'OK', data: comentario });
  } catch (error: any) {
    if (error instanceof NotFoundError) {
      res.status(404).json({ message: 'Resource not found' });
    } else {
      res.status(500).json({ message: 'Internal server error' });
    }
  }
}

async function add(req: Request, res: Response) {
  try {
    const em = orm.em.fork();
    const comentario = em.create(ComentarioPost, req.body.sanitizedInput);
    await em.flush();
    res.status(201).json({ message: 'Resource created', data: comentario });
  } catch (error: any) {
    res.status(500).json({ message: 'Internal server error' });
  }
}

async function update(req: Request, res: Response) {
  try {
    const em = orm.em.fork();
    const id = Number.parseInt(req.params.id);
    const comentario = await em.findOneOrFail(ComentarioPost, { id });
    em.assign(comentario, req.body.sanitizedInput);
    await em.flush();
    res.status(200).json({ message: 'Resource updated', data: comentario });
  } catch (error: any) {
    if (error instanceof NotFoundError) {
      res.status(404).json({ message: 'Resource not found' });
    } else {
      res.status(500).json({ message: 'Internal server error' });
    }
  }
}

async function remove(req: Request, res: Response) {
  try {
    const em = orm.em.fork();
    const id = Number.parseInt(req.params.id);
    const comentario = await em.findOneOrFail(ComentarioPost, { id });
    await em.removeAndFlush(comentario);
    res.status(200).json({ message: 'Resource deleted', data: comentario });
  } catch (error: any) {
    if (error instanceof NotFoundError) {
      res.status(404).json({ message: 'Resource not found' });
    } else {
      res.status(500).json({ message: 'Internal server error' });
    }
  }
}

export { findAll, findOne, add, update, remove, sanitizeComentario };
