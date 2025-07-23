import { Request,Response,NextFunction } from "express"
import { Piloto } from "./piloto.entity.js"
import { orm } from "../shared/db/orm.js"
import { NotFoundError } from "@mikro-orm/core"

const em = orm.em

//get todos los pilotos
async function findAll(req:Request,res:Response){
   try{
       const pilotos = await em.find(Piloto, {})
       res.status(200).json({message:'OK',data:pilotos})
   }catch(error:any){
       res.status(500).json({message: 'Internal server error'});
   }
}

//get para un piloto en específico
async function findOne(req:Request,res:Response) { 
   try{
    const id = Number.parseInt(req.params.id)
    const piloto = await em.findOneOrFail(Piloto, {id})
    res.status(200).json({message:'OK',data:piloto})
  }catch(error:any){
    if (error instanceof NotFoundError){
      res.status(404).json({message:'Resource not found'})
    }else{
      res.status(500).json({message: 'Internal server error'});
    }
  }
}

//post un nuevo piloto
async function add(req:Request,res:Response){
  try{
    const piloto = em.create(Piloto, req.body)
    await em.flush()
    res.status(201).json({message:'Created', data: piloto})
  }catch(error:any){
    res.status(500).json({message: 'Internal server error'});
  }
}

//put&patch de piloto
async function update(req:Request,res:Response) { 

   try{
    const id = Number.parseInt(req.params.id)
    const piloto = em.getReference(Piloto,id)
    em.assign(piloto,req.body)
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

async function remove(req:Request,res:Response){ 
   try{
    const id = Number.parseInt(req.params.id)
    const piloto = em.getReference(Piloto,id)
    await em.removeAndFlush(piloto)
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