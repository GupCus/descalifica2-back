import { Request,Response,NextFunction } from "express"
import { Escuderia } from "./escuderia.entity.js"
import { orm } from "../shared/db/orm.js"
import { NotFoundError } from "@mikro-orm/core"

const em = orm.em

//get todos los Escuderias
async function findAll(req:Request,res:Response){
  try{
    const escuderias = await em.find(Escuderia, {})
    res.status(200).json({message:'OK',data:escuderias})
  }catch(error:any){
    res.status(500).json({message: 'Internal server error'});
  }
}

//get para un Escuderia en específico
async function findOne(req:Request,res:Response) { 
   try{
    const id = Number.parseInt(req.params.id)
    const escuderia = await em.findOneOrFail(Escuderia, {id})
    res.status(200).json({message:'OK',data:escuderia})
  }catch(error:any){
    if (error instanceof NotFoundError){
      res.status(404).json({message:'Resource not found'})
    }else{
      res.status(500).json({message: 'Internal server error'});
    }
  }
}

//post un nuevo Escuderia
async function add(req:Request,res:Response){
  
  try{
    const escuderia = em.create(Escuderia, req.body)
    await em.flush()
    res.status(201).json({message:'Created', data: escuderia})
  }catch(error:any){
    res.status(500).json({message: 'Internal server error'});
  }
}

//put&patch de Escuderia
async function update(req:Request,res:Response) { 
   try{
    const id = Number.parseInt(req.params.id)
    const escuderia = em.getReference(Escuderia,id)
    em.assign(escuderia,req.body)
    await em.flush()
    res.status(204).json({message:'Updated'})
  }catch(error:any){
    if (error instanceof NotFoundError){
      res.status(404).json({message:'Resource not found'})
    }else{
      res.status(500).json({message: 'Internal server error'});
    }
  }
}

//Aunque este definida en el repository con un parametro {id: string} de esta forma tenemos la versatilidad de que manden tanto asi como el character entero
async function remove(req:Request,res:Response){ 
   try{
    const id = Number.parseInt(req.params.id)
    const escuderia = em.getReference(Escuderia,id)
    await em.removeAndFlush(escuderia)
    res.status(204).json({message:'Deleted'})
  }catch(error:any){
    if (error instanceof NotFoundError){
      res.status(404).json({message:'Resource not found'})
    }else{
      res.status(500).json({message: 'Internal server error'});
    }
  }
}

export { findAll, findOne, add, update, remove}

//Nota para la posterioridad, dejo todos los catch iguales que el findOne, esto es para que en un futuro encontrar una forma de que si no existe el objeto necesario, devuelva not found. Falta implementar.