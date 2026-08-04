import {Request, Response, NextFunction} from 'express'
import { Blogpost } from './blogpost.entity.js'
import { orm } from '../shared/db/orm.js'
import { NotFoundError } from '@mikro-orm/core'
import { deleteFile, buildImageUrl, getRelativePath } from "../shared/upload/upload.utils.js";
const em = orm.em

function sanitizeBlogpost(req: Request, res: Response, next: NextFunction){ 
  req.body.sanitizedInput = {
      title: req.body.title,
      content: req.body.content,
      author:req.body.authorID ? Number(req.body.authorID) : undefined,
      id:req.params.id
  }
    Object.keys(req.body.sanitizedInput).forEach(key => {
      if(req.body.sanitizedInput[key] === undefined){delete req.body.sanitizedInput[key]}
    })  
  next()
}

function addImageUrls(req: Request, blogpost: Blogpost) {
  const result: any = { ...blogpost };
  if (blogpost.cover_image) {
    result.cover_image_url = buildImageUrl(req, blogpost.cover_image);
  }
  return result;
}

// obtener todos los blogposts

async function findAll(req:Request,res:Response){
    try{
        const blogposts = await em.find(Blogpost, {})
        const data = blogposts.map(b => addImageUrls(req, b))
        res.status(200).json({message:'OK',data})
    }catch(error:any){
        res.status(500).json({message: 'Internal server error'});
    }
}

// Obtener un blogpost por ID

async function findOne(req:Request,res:Response) {
    try{ 
      const id = Number.parseInt(req.params.id)
      const blogpost = await em.findOneOrFail(Blogpost, {id})
      res.status(200).json({message:'OK',data:addImageUrls(req, blogpost)})
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
    if (req.file) {
      req.body.sanitizedInput.cover_image = getRelativePath(req.file.path);
    }
    const blogpost = em.create(Blogpost, req.body.sanitizedInput)
    await em.flush()
    res.status(201).json({message:'Resource created',data:addImageUrls(req, blogpost)})
  }catch(error:any){
    res.status(500).json({message: 'Internal server error'});
  } 
}

//Actualizar un blogpost

async function update(req:Request,res:Response){
  try{
    const id = Number.parseInt(req.params.id)
    const blogpost = await em.findOneOrFail(Blogpost, {id})
    if (req.file) {
      req.body.sanitizedInput.cover_image = getRelativePath(req.file.path);
      if (blogpost.cover_image) {
        deleteFile(blogpost.cover_image);
      }
    }
    em.assign(blogpost, req.body.sanitizedInput)
    await em.flush()
    res.status(200).json({message:'Resource updated',data:addImageUrls(req, blogpost)})
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
    if (blogpost.cover_image) {
      deleteFile(blogpost.cover_image);
    }
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

async function uploadCoverImage(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id);
    const blogpost = await em.findOneOrFail(Blogpost, { id });

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    if (blogpost.cover_image) {
      deleteFile(blogpost.cover_image);
    }

    blogpost.cover_image = getRelativePath(req.file.path);
    await em.flush();

    res.status(200).json({ message: 'Cover image uploaded successfully', data: addImageUrls(req, blogpost) });
  } catch (error: any) {
    if (error instanceof NotFoundError) {
      res.status(404).json({ message: 'Resource not found' });
    } else {
      res.status(500).json({ message: 'Internal server error' });
    }
  }
}

async function deleteCoverImage(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id);
    const blogpost = await em.findOneOrFail(Blogpost, { id });

    if (blogpost.cover_image) {
      deleteFile(blogpost.cover_image);
      blogpost.cover_image = undefined;
      await em.flush();
    }

    res.status(200).json({ message: 'Cover image deleted successfully', data: addImageUrls(req, blogpost) });
  } catch (error: any) {
    if (error instanceof NotFoundError) {
      res.status(404).json({ message: 'Resource not found' });
    } else {
      res.status(500).json({ message: 'Internal server error' });
    }
  }
}

export {findAll, findOne, add, update, remove, sanitizeBlogpost, uploadCoverImage, deleteCoverImage}
