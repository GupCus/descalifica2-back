import { Router } from "express";
import {  findAll,findOne, add, update, remove } from "./escuderia.controller.js";

export const escuderiaRouter = Router()

escuderiaRouter.get('/',findAll)
escuderiaRouter.get('/:id',findOne)
escuderiaRouter.post('/',add)
escuderiaRouter.put('/:id',update)
//escuderiaRouter.patch('/:id',(_,res)=> res.send(501).json({message:'Not Implemented'}))
escuderiaRouter.delete('/:id',remove)