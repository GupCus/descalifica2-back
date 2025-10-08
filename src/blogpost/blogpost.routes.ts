import { Router } from "express";
import { findAll,findOne, add, update, remove , sanitizeBlogpost } from "./blogpost.controller.js";

export const blogpostRouter = Router()

  blogpostRouter.get('/',findAll)
  blogpostRouter.get('/:id',findOne)
  blogpostRouter.post('/',sanitizeBlogpost,add)
  blogpostRouter.put('/:id',sanitizeBlogpost,update)
  blogpostRouter.patch('/:id',sanitizeBlogpost,update)
  blogpostRouter.delete('/:id',remove)

