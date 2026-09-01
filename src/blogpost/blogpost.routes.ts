import { authenticateToken } from '../auth/auth.middleware.js';
import { Router } from "express";
import { findAll, findOne, add, update, remove, sanitizeBlogpost, uploadCoverImage, deleteCoverImage } from "./blogpost.controller.js";
import { uploadImage, uploadImageOptional } from "../shared/upload/upload.middleware.js";

export const blogpostRouter = Router()

  blogpostRouter.get('/', findAll)
  blogpostRouter.get('/:id', findOne)
  blogpostRouter.post('/', authenticateToken, ...uploadImageOptional("blogposts", "covers"), sanitizeBlogpost, add)
  blogpostRouter.put('/:id', authenticateToken, ...uploadImageOptional("blogposts", "covers"), sanitizeBlogpost, update)
  blogpostRouter.patch('/:id', authenticateToken, ...uploadImageOptional("blogposts", "covers"), sanitizeBlogpost, update)

  blogpostRouter.patch('/:id/cover-image', authenticateToken, ...uploadImage("blogposts", "covers"), uploadCoverImage)
  blogpostRouter.delete('/:id/cover-image', authenticateToken, deleteCoverImage)

  blogpostRouter.delete('/:id', authenticateToken, remove)
