import { Categoria } from "./categoria.entity.js";
import { NextFunction, Request, Response } from "express";
import { orm } from "../shared/db/orm.js";

const em = orm.em

function sanitizeCategoriaInput(req: Request, res: Response, next: NextFunction){ 
  req.body.sanitizedInput = {
      name: req.body.name,
      description: req.body.description,
      escuderias: req.body.escuderias,
      drivers: req.body.drivers,
      seasons: req.body.seasons,
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

//findOne
async function findOne(req:Request,res:Response) { 
    try{
      const id = Number.parseInt(req.params.id)
      const categoria = await em.findOneOrFail(Categoria, {id})
      res.status(200).json({data: categoria})
    }catch(error: any){
      res.status(500).json({message: error.message})
    }
}

//add
async function add(req:Request,res:Response){
  try{
    const categoria = em.create(Categoria, req.body.sanitizedInput)
    await em.flush()
    res.status(201).json({message: 'categoria created succesfully', data: categoria})
  }catch(error:any){
    res.status(500).json({ message: error.message})
  }
}

//update
async function update(req:Request,res:Response) { 
  try{
    const id = Number.parseInt(req.params.id)
    const categoria = em.getReference(Categoria, id )
    em.assign(categoria, req.body)
    await em.flush()
    res.status(200).json({message: 'Updated succesfully', data: categoria})
  }catch(error: any){
    res.status(500).json({message: error.message})
  }
}

//delete
async function remove(req:Request,res:Response){ 
  try{
    const id = Number.parseInt(req.params.id)
    const categoria = em.getReference(Categoria, id)
    await em.removeAndFlush(categoria)
    res.status(200).json({message: 'deleted succesfully', data: categoria})
  }catch(error: any){
    res.status(500).json({message: error.message})
  }
}

export {sanitizeCategoriaInput, findAll, findOne, add, update, remove}