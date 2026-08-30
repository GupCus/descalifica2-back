import { Router } from "express";
import { findAll, findOne, add, update, remove, sanitizeBlogpost, uploadCoverImage, deleteCoverImage,findSuggested } from "./blogpost.controller.js";
import { uploadImage, uploadImageOptional } from "../shared/upload/upload.middleware.js";

export const blogpostRouter = Router()

  blogpostRouter.get('/', findAll)
  blogpostRouter.get('/:id', findOne)
  blogpostRouter.post('/', ...uploadImageOptional("blogposts", "covers"), sanitizeBlogpost, add)
  blogpostRouter.put('/:id', ...uploadImageOptional("blogposts", "covers"), sanitizeBlogpost, update)
  blogpostRouter.patch('/:id', ...uploadImageOptional("blogposts", "covers"), sanitizeBlogpost, update)

  blogpostRouter.patch('/:id/cover-image', ...uploadImage("blogposts", "covers"), uploadCoverImage)
  blogpostRouter.delete('/:id/cover-image', deleteCoverImage)
  blogpostRouter.get('/suggested/:userId', findSuggested)
  blogpostRouter.delete('/:id', remove)
