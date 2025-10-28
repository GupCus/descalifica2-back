import { orm } from '../shared/db/orm.js';
import { Temporada } from './temporada.entity.js';
import { Request, Response, NextFunction } from 'express';

const em = orm.em;

function sanitizeTemporadaInput(
  req: Request,
  res: Response,
  next: NextFunction
) {
  req.body.sanitizedInput = {
    year: req.body.year,
    races: req.body.races,
    racing_series: req.body.racing_series,
    winner_driver: req.body.winner_driver,
    winner_team: req.body.winner_team,
    id: req.body.id,
  };
  Object.keys(req.body.sanitizedInput).forEach((key) => {
    if (req.body.sanitizedInput[key] === undefined) {
      delete req.body.sanitizedInput[key];
    }
  });
  next();
}

//findALL
async function findAll(req: Request, res: Response) {
  try {
    const temporada = await em.find(
      Temporada,
      {},
      { populate: ['racing_series'] }
    );
    res.status(200).json({ message: 'findAll Temporadas', data: temporada });
  } catch (error: any) {
    res.status(500).json({ message: 'Internal server error' });
  }
}

//findOne
async function findOne(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id);
    const temporada = await em.findOneOrFail(
      Temporada,
      { id },
      { populate: ['racing_series'] }
    );
    res.status(200).json({ data: temporada });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

//add
async function add(req: Request, res: Response) {
  try {
    const temporada = em.create(Temporada, req.body.sanitizedInput);
    await em.flush();
    res
      .status(201)
      .json({ message: 'temporada created succesfully', data: temporada });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

//update
async function update(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id);
    const temporada = em.getReference(Temporada, id);
    em.assign(temporada, req.body);
    await em.flush();
    res.status(200).json({ message: 'Updated succesfully', data: temporada });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

//delete
async function remove(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id);
    const temporada = em.getReference(Temporada, id);
    await em.removeAndFlush(temporada);
    res.status(200).json({ message: 'deleted succesfully', data: temporada });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

export { sanitizeTemporadaInput, findAll, findOne, add, update, remove };
