import { EscuderiaRepository } from "../escuderia/escuderia.repository.js";
import { pilotoRepository } from "../piloto/piloto.repository.js";
import { Categoria } from "./categoria.entity.mem.js";
import { CategoriaRepository } from "./categoria.repository.js";
import { NextFunction, Request, Response } from "express";



const repository = new CategoriaRepository()

function sanitizeCategoriaInput(req: Request, res: Response, next: NextFunction){ 
  req.body.sanitizedInput = {
      name: req.body.name,
      escuderias: (new EscuderiaRepository).findAll(),
      pilotos: (new pilotoRepository).findAll(),
      id: req.params.id
  }
   Object.keys(req.body.sanitizedInput).forEach(key => { 
      if(req.body.sanitizedInput[key] === undefined){delete req.body.sanitizedInput[key]}
   })
  next()
}

function findAll(req:Request,res:Response){
   res.status(200).send({message: 'Categorías', data: repository.findAll()});
}

function findOne(req:Request,res:Response) { 
    const categoria = repository.findOne({id:req.params.id})
    if(!categoria){
        res.status(404).send({message: 'Categoría no encontrado.'})
    }
    res.status(200).send({message: 'Categoría encontrada', data: categoria})
}

function add(req:Request,res:Response){
  
    const input = req.body.sanitizedInput //utilizo la input limpia

    const categoria = new Categoria(
      input.name,
      input.escuderias, //preguntar como ingresar varios, creo que es como cuando hace los objetos
      input.pilotos
    )

    repository.add(categoria)
    res.status(201).send({message: 'Categoría creada correctamente.', data: categoria})
}

function update(req:Request,res:Response) { 

  const categoria = repository.update(req.body.sanitizedInput)
  
  if(!categoria){
      res.status(404).send({message: 'Categoría no encontrada.'})
  }else{
  res.status(200).send({ message: 'Categoría modificada correctamente.', data: categoria})
  }
}

function remove(req:Request,res:Response){ 
  const categoria = repository.remove(req.body.sanitizedInput)

  if(!categoria){
      res.status(404).send({message: 'Categoría no encontrada.'})
  }else{
      res.status(200).send({message: 'Categoría borrada correctamente.'})
  }
}

export {sanitizeCategoriaInput, findAll, findOne, add, update, remove}