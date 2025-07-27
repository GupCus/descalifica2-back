import { Categoria } from "./categoria.entity.mem.js";
import { NextFunction, Request, Response } from "express";
import { orm } from "../shared/db/orm.js";
import { Piloto } from "../piloto/piloto.entity.js";
import { Escuderia } from "../escuderia/escuderia.entity.js";

const em = orm.em

function sanitizeCategoriaInput(req: Request, res: Response, next: NextFunction){ 
  req.body.sanitizedInput = {
      name: req.body.name,
      escuderias: req.body.escuderias,
      pilotos: req.body.pilotos,
      id: req.params.id
  }
   Object.keys(req.body.sanitizedInput).forEach(key => { 
      if(req.body.sanitizedInput[key] === undefined){delete req.body.sanitizedInput[key]}
   })
  next()
}
 //findALL
async function findAll(req:Request,res:Response){
  try{
    const categorias = await em.find(Categoria, {})
    res.status(200).json({message: 'findAll categorías:', data: categorias})
  }catch(error:any){
    res.status(500).json({message: 'Internal server error'});
  }
}

function findOne(req:Request,res:Response) { 
    res.status(200).send({message: 'Not implemented yet'})
}

async function add(req:Request,res:Response){
  try{
    const categoria = em.create(Categoria, req.body.sanitizedInput)
    await em.flush()
    res.status(201).json({message: 'categoria created succesfully', data: categoria})
  }catch(error:any){
    res.status(500).json({ message: error.message})
  }
}

function update(req:Request,res:Response) { 
  res.status(200).send({message: 'Not implemented yet'})
}

function remove(req:Request,res:Response){ 
  res.status(200).send({message: 'Not implemented yet'})
}

export {sanitizeCategoriaInput, findAll, findOne, add, update, remove}