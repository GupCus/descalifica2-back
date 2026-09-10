import { Request, Response, NextFunction } from 'express';
import { orm } from '../shared/db/orm.js';
import { NotFoundError } from '@mikro-orm/core';
import { Driver_Championship } from './driver_championship.entity.js';
import { Temporada } from '../temporada/temporada.entity.js';
import { Team_Championship } from './team_championship.entity.js';

const em = orm.em;
function sanitizeChampionshipInput(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  req.body.sanitizedInput = {
    points: req.body.points,
    position: req.body.position,
    season: req.body.season,
    id: req.params.id,
  };
  if (req.query.tipo === 'pilotos') {
    req.body.sanitizedInput.piloto = req.body.piloto;
  } else if (req.query.tipo === 'escuderias') {
    req.body.sanitizedInput.escuderia = req.body.escuderia;
  } else {
    return res.status(400).json({
      message:
        'Mal formada, pone de parametro /championship?tipo=[pilotos|escuderias]',
    });
  }
  Object.keys(req.body.sanitizedInput).forEach((key) => {
    if (req.body.sanitizedInput[key] === undefined) {
      delete req.body.sanitizedInput[key];
    }
  });
  next();
}

// Obtener todos los resultados

async function findAll(req: Request, res: Response) {
  try {
    const tempactual = await em.findOne(Temporada, {
      year: new Date().getFullYear(),
    });
    let championship;
    if (req.query.tipo === 'pilotos') {
      championship = await em.find(
        Driver_Championship,
        { season: tempactual },
        { populate: ['piloto'] },
      );
    } else if (req.query.tipo === 'escuderias') {
      championship = await em.find(
        Team_Championship,
        { season: tempactual },
        { populate: ['escuderia'] },
      );
    } else {
      throw new Error('Bad Request');
    }
    res.status(200).json({ message: 'OK', data: championship });
  } catch (error: any) {
    res.status(500).json({ message: 'Hubo un problema con tu solicitud' });
  }
}

// Crear una resultado
async function add(req: Request, res: Response) {
  try {
    const resultadoData = { ...req.body.sanitizedInput };
    const tempactual = await em.findOne(Temporada, {
      year: new Date().getFullYear(),
    });
    if (!resultadoData.season && tempactual) {
      resultadoData.season = tempactual;
    }
    let championship;
    if (req.query.tipo === 'pilotos') {
      championship = em.create(Driver_Championship, resultadoData);
    } else if (req.query.tipo === 'escuderias') {
      championship = em.create(Team_Championship, resultadoData);
    } else {
      throw new Error('Bad Request');
    }
    await em.flush();
    res.status(201).json({
      message: 'Championship result created successfully',
      data: championship,
    });
  } catch (error: any) {
    console.error('Error creating sesion:', error);
    res.status(500).json({ message: 'Hubo un problema con tu solicitud' });
  }
}

// Actualizar un resultado

async function update(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id);
    let resultado;
    if (req.query.tipo === 'pilotos') {
      resultado = await em.findOneOrFail(Driver_Championship, { id });
    } else if (req.query.tipo === 'escuderias') {
      resultado = await em.findOneOrFail(Team_Championship, { id });
    } else {
      throw new Error('Bad Request');
    }
    em.assign(resultado, req.body.sanitizedInput);

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

// Eliminar un resultado

async function remove(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id);
    let resultado;
    if (req.query.tipo === 'pilotos') {
      resultado = em.getReference(Driver_Championship, id);
    } else if (req.query.tipo === 'escuderias') {
      resultado = em.getReference(Team_Championship, id);
    } else {
      throw new Error('Bad Request');
    }
    await em.removeAndFlush(resultado);
    res.status(204).json({ message: 'Deleted' });
  } catch (error: any) {
    if (error instanceof NotFoundError) {
      res.status(404).json({ message: 'Resource not found' });
    } else {
      res.status(500).json({ message: 'Internal server error' });
    }
  }
}

export { findAll, add, update, remove, sanitizeChampionshipInput };
