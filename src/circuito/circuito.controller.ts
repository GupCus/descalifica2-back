import { Request, Response, NextFunction } from 'express';
import { Circuito } from './circuito.entity.js';
import { orm } from '../shared/db/orm.js';
import { NotFoundError } from '@mikro-orm/core';

const em = orm.em;

function sanitizeCircuitoInput(req: Request, res: Response, next: NextFunction) {
  req.body.sanitizedInput = {
    name: req.body.name,
    country: req.body.country,
    length: req.body.length,
    year: req.body.year,
    id: req.body.id,
  };

  Object.keys(req.body.sanitizedInput).forEach((key) => {
    if (req.body.sanitizedInput[key] === undefined) {
      delete req.body.sanitizedInput[key];
    }
  });
  next();
}

//get todos los Circuitos
async function findAll(req: Request, res: Response) {
  try {
    const circuitos = await em.find(Circuito, {});
    res.status(200).json({ message: 'OK', data: circuitos });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

//get para un Circuito en específico
async function findOne(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id);
    const circuito = await em.findOneOrFail(Circuito, { id });
    res.status(200).json({ message: 'OK', data: circuito });
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
    await em.flush();
    res
      .status(201)
      .json({ message: 'Circuito created successfully', data: circuito });
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
    em.assign(circuito, req.body.sanitizedInput);
    await em.flush();
    res
      .status(200)
      .json({ message: 'Circuito updated successfully', data: circuito });
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

export { findAll, findOne, add, update, remove, sanitizeCircuitoInput };
