import { Request,Response,NextFunction } from "express"
import { Usuario } from "./usuario.entity.js"
import { orm } from "../shared/db/orm.js"
import { NotFoundError } from "@mikro-orm/core"

const em = orm.em

function sanitizeUsuario(req: Request, res: Response, next: NextFunction){ 
  req.body.sanitizedInput = {
      username: req.body.username,
      password: req.body.password,
      name: req.body.name,
      surname: req.body.surname,
      email: req.body.email,
      date_of_birth: req.body.date_of_birth,
      fav_driver: req.body.fav_driver,
      fav_team: req.body.fav_team,
      fav_circuit: req.body.fav_circuit,
      bio: req.body.bio,
      id: req.params.id
  }
   Object.keys(req.body.sanitizedInput).forEach(key => { 
      if(req.body.sanitizedInput[key] === undefined){delete req.body.sanitizedInput[key]}
   })
  next()
}

// obtener todos los usuarios 

async function findAll(req:Request,res:Response){
    try{
        const usuarios = await em.find(Usuario, {})
        res.status(200).json({message:'OK',data:usuarios})
    }catch(error:any){
        res.status(500).json({message: 'Internal server error'});
    }
}


// Obtener un usuario por ID

async function findOne(req:Request,res:Response) {
    try{ 
      const id = Number.parseInt(req.params.id)
      const usuario = await em.findOneOrFail(Usuario, {id})
      res.status(200).json({message:'OK',data:usuario})
    }catch(error:any){
      if (error instanceof NotFoundError){
        res.status(404).json({message:'Resource not found'})
      }else{
        res.status(500).json({message: 'Internal server error'});
      } 
    }
}

//Crear un nuevo usuario 

async function add(req:Request,res:Response){
  try{
    const usuario = em.create(Usuario, req.body.sanitizedInput)
    await em.flush()
    res.status(201).json({message:'Created', data: usuario})
  }catch(error:any){
    console.error('Error creating usuario:', error);
    res.status(500).json({message: 'Internal server error', error: error.message});
  }
}

//Actualizar un usuario existente

async function update(req:Request,res:Response) {
   try{
    const id = Number.parseInt(req.params.id)
    const usuario = await em.findOneOrFail(Usuario,{id})
    em.assign(usuario,req.body.sanitizedInput)
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

//Eliminar un usuario 

async function remove(req:Request,res:Response){ 
   try{
    const id = Number.parseInt(req.params.id)
    const usuario = await em.findOneOrFail(Usuario,{id})
    await em.removeAndFlush(usuario)
    res.status(204).json({message:'Deleted'})
  }catch(error:any){
    if (error instanceof NotFoundError){
      res.status(404).json({message:'Resource not found'})
    }else{
      res.status(500).json({message: 'Internal server error'});
    } 
  }
}

export {sanitizeUsuario, findAll, findOne, add, update, remove}
