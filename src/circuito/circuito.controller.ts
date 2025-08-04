/*import { Request, Response, NextFunction } from 'express';
// import { CircuitoRepository } from './circuito.repository.js';
import { Circuito } from './circuito.entity.js';

// const repository = new CircuitoRepository();

function sanitizeCircuitoInput(
  req: Request,
  res: Response,
  next: NextFunction
) {
  req.body.sanitizedInput = {
    name: req.body.name,
    country: req.body.country,
    length: req.body.length,
    year: req.body.year,
    id: req.params.id,
  };

  Object.keys(req.body.sanitizedInput).forEach((key) => {
    if (req.body.sanitizedInput[key] === undefined) {
      delete req.body.sanitizedInput[key];
    }
  });
  next();
}

//get todos los Circuitos
function findAll(req: Request, res: Response) {
  res.status(200).send({ message: 'Circuitos', data: repository.findAll() });
}

//get para un Circuito en específico
function findOne(req: Request, res: Response) {
  const Circuito = repository.findOne({ id: req.params.id });
  if (!Circuito) {
    //if circuito es un undefined (no lo encontró)
    res.status(404).send({ message: 'Circuito no encontrado.' });
  }
  res.status(200).send({ message: 'Circuito encontrado', data: Circuito });
}

//post un nuevo Circuito
function add(req: Request, res: Response) {
  const input = req.body.sanitizedInput; //utilizo la input limpia

  const circuito = new Circuito(
    input.name,
    input.fundation,
    input.nationality,
    input.engine //MODIFICAR
  );

  repository.add(circuito);
  res
    .status(201)
    .send({ message: 'Circuito creado correctamente.', data: circuito });
}

//put&patch de Circuito

function update(req: Request, res: Response) {
  const circuito = repository.update(req.body.sanitizedInput);

  if (!circuito) {
    res.status(404).send({ message: 'Circuito no encontrado.' });
  } else {
    res
      .status(200)
      .send({ message: 'Circuito modificado correctamente.', data: circuito });
  }
}

//Aunque este definida en el repository con un parametro {id: string} de esta forma tenemos la versatilidad de que manden tanto asi como el character entero
function remove(req: Request, res: Response) {
  const circuito = repository.remove(req.body.sanitizedInput);

  if (!circuito) {
    res.status(404).send({ message: 'Circuito no encontrado.' });
  } else {
    res.status(200).send({ message: 'Circuito borrado correctamente.' });
  }
}

export { sanitizeCircuitoInput, findAll, findOne, add, update, remove };*/ 
