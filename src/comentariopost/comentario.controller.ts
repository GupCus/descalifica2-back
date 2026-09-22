import { Request, Response, NextFunction } from 'express';
import { ComentarioPost } from './comentario.entity.js';
import { Blogpost } from '../blogpost/blogpost.entity.js';
import { orm } from '../shared/db/orm.js';
import { NotFoundError } from '@mikro-orm/core';
import { populate } from 'dotenv';

function sanitizeComentario(req: Request, res: Response, next: NextFunction) {
  req.body.sanitizedInput = {
    id: req.params.id,
    content: req.body.content,
    createdAt: new Date(),
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
  /*
    #swagger.tags = ['Foro: Comentarios']
    #swagger.summary = 'Obtener todos los comentarios'
    #swagger.responses[200] = { 
      description: 'OK',
      schema: { message: { type: 'string', example: 'OK' }, data: [{ $ref: '#/components/schemas/ComentarioPost' }] }
    }
    #swagger.responses[500] = { schema: { $ref: '#/components/schemas/ErrorServer' } }
  */
  try {
    const em = orm.em.fork();
    const filter = req.query.blogpost
      ? { blogpost: Number(req.query.blogpost) }
      : {};
    const comentarios = await em.find(ComentarioPost, filter);
    res.status(200).json({ message: 'OK', data: comentarios });
  } catch (error: any) {
    res.status(500).json({ message: 'Internal server error' });
  }
}

async function findOne(req: Request, res: Response) {
  /*
    #swagger.tags = ['Foro: Comentarios']
    #swagger.summary = 'Obtener un comentario'
    #swagger.responses[200] = { 
      description: 'OK',
      schema: { message: { type: 'string', example: 'OK' }, data: { $ref: '#/components/schemas/ComentarioPost' } }
    }
    #swagger.responses[404] = { schema: { $ref: '#/components/schemas/NotFound' } }
    #swagger.responses[500] = { schema: { $ref: '#/components/schemas/ErrorServer' } }
  */
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
  /*
    #swagger.tags = ['Foro: Comentarios']
    #swagger.summary = 'Crear un comentario'
    #swagger.security = [{ "bearerAuth": [] }]
    #swagger.parameters['body'] = {
      in: 'body',
      required: true,
      schema: { $ref: "#/components/schemas/ComentarioPostInput" }
    }
    #swagger.responses[201] = { 
      description: 'Resource created',
      schema: { message: { type: 'string', example: 'Resource created' }, data: { $ref: '#/components/schemas/ComentarioPost' } }
    }
    #swagger.responses[400] = { description: 'Bad Request' }
    #swagger.responses[404] = { schema: { $ref: '#/components/schemas/NotFound' } }
    #swagger.responses[500] = { schema: { $ref: '#/components/schemas/ErrorServer' } }
  */
  try {
    const em = orm.em.fork();
    const authReq = req as any;
    const blogpostId = Number(req.body.blogpost);
    if (Number.isNaN(blogpostId)) {
      return res.status(400).json({ message: 'blogpost inválido' });
    }
    const blogpost = await em.findOne(Blogpost, { id: blogpostId });
    if (!blogpost) {
      return res.status(404).json({ message: 'Blogpost not found' });
    }
    req.body.sanitizedInput.author = authReq.user.id;
    const comentario = em.create(ComentarioPost, req.body.sanitizedInput);
    await em.flush();
    res.status(201).json({ message: 'Resource created', data: comentario });
  } catch (error: any) {
    res.status(500).json({ message: 'Internal server error' });
  }
}

async function remove(req: Request, res: Response) {
  /*
    #swagger.tags = ['Foro: Comentarios']
    #swagger.summary = 'Eliminar un comentario'
    #swagger.security = [{ "bearerAuth": [] }]
    #swagger.responses[200] = { 
      description: 'Resource deleted',
      schema: { message: { type: 'string', example: 'Resource deleted' }, data: { $ref: '#/components/schemas/ComentarioPost' } }
    }
    #swagger.responses[403] = { description: 'Forbidden' }
    #swagger.responses[404] = { schema: { $ref: '#/components/schemas/NotFound' } }
    #swagger.responses[500] = { schema: { $ref: '#/components/schemas/ErrorServer' } }
  */
  try {
    const em = orm.em.fork();
    const id = Number.parseInt(req.params.id);
    const comentario = await em.findOneOrFail(
      ComentarioPost,
      { id },
      { populate: ['author'] },
    );
    const user = (req as any).user;
    if (comentario.author.id !== user.id && user.user_type !== 'admin') {
      res.status(403).json({ message: 'Forbidden' });
      return;
    }
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

async function countsByBlogpost(req: Request, res: Response) {
  /*
    #swagger.tags = ['Foro: Comentarios']
    #swagger.summary = 'Obtener conteo de comentarios por blogpost'
    #swagger.responses[200] = { 
      description: 'OK',
      schema: { 
        message: { type: 'string', example: 'OK' },
        data: { 
          "1": { type: 'integer', example: 5 },
          "2": { type: 'integer', example: 10 }
        }
      }
    }
  */
  const em = orm.em.fork();
  const ids = String(req.query.blogposts ?? '')
    .split(',')
    .map((s) => Number.parseInt(s.trim(), 10))
    .filter((n) => !Number.isNaN(n));
  const counts: Record<number, number> = {};
  if (ids.length > 0) {
    const rows = await em.find(
      ComentarioPost,
      { blogpost: { $in: ids } },
      { fields: ['blogpost.id'] },
    );
    for (const c of rows) {
      const blogpostId = Number(c.blogpost?.id);
      if (!Number.isNaN(blogpostId)) {
        counts[blogpostId] = (counts[blogpostId] ?? 0) + 1;
      }
    }
  }
  res.status(200).json({ message: 'OK', data: counts });
}
export { findAll, findOne, add, remove, sanitizeComentario, countsByBlogpost };
