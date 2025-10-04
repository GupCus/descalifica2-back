import {Request, Response, NextFunction} from 'express'
import { Blogpost } from './blogpost.entity.js'
import { orm } from '../shared/db/orm.js'
import { NotFoundError } from '@mikro-orm/core'

const em = orm.em

function sanitizeBlogpost(req: Request, res: Response, next: NextFunction){ 
  req.body.sanitizedInput = {
      title: req.body.title,
      content: req.body.content
  }
    Object.keys(req.body.sanitizedInput).forEach(key => {
      if(req.body.sanitizedInput[key] === undefined){delete req.body.sanitizedInput[key]}
    })  
  next()
}

// obtener todos los blogposts

async function findAll(req:Request,res:Response){
    try{
        const blogposts = await em.find(Blogpost, {})
        res.status(200).json({message:'OK',data:blogposts})
    }catch(error:any){
        res.status(500).json({message: 'Internal server error'});
    }
}

// Obtener un blogpost por ID

async function findOne(req:Request,res:Response) {
    try{ 
      const id = Number.parseInt(req.params.id)
      const blogpost = await em.findOneOrFail(Blogpost, {id})
      res.status(200).json({message:'OK',data:blogpost})
    }catch(error:any){
      if (error instanceof NotFoundError){
        res.status(404).json({message:'Resource not found'})
      }else{
        res.status(500).json({message: 'Internal server error'});
      }
    }
}

//Crear un nuevo blogpost

async function add(req:Request,res:Response){
  try{
    const blogpost = em.create(Blogpost, req.body.sanitizedInput)
    await em.flush()
    res.status(201).json({message:'Resource created',data:blogpost})
  }catch(error:any){
    res.status(500).json({message: 'Internal server error'});
  } 
}

//Actualizar un blogpost

async function update(req:Request,res:Response){
  try{
    const id = Number.parseInt(req.params.id)
    const blogpost = await em.findOneOrFail(Blogpost, {id})
    em.assign(blogpost, req.body.sanitizedInput)
    await em.flush()
    res.status(200).json({message:'Resource updated',data:blogpost})
  }catch(error:any){
    if (error instanceof NotFoundError){
      res.status(404).json({message:'Resource not found'})
    }else{
      res.status(500).json({message: 'Internal server error'});
    }
  }
}

//Eliminar un blogpost

async function remove(req:Request,res:Response){
  try{
    const id = Number.parseInt(req.params.id)
    const blogpost = await em.findOneOrFail(Blogpost, {id})
    await em.remove(blogpost).flush()
    res.status(200).json({message:'Resource deleted'})
  }catch(error:any){
    if (error instanceof NotFoundError){
      res.status(404).json({message:'Resource not found'})
    }else{
      res.status(500).json({message: 'Internal server error'});
    } 
  }
}

export {findAll, findOne, add, update, remove, sanitizeBlogpost}
