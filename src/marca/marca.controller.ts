// import { Request,Response,NextFunction } from "express"
// import { Marca } from "./marca.entity.js"
// import { orm } from "../shared/db/orm.js"
// import { NotFoundError } from "@mikro-orm/core"

// const em = orm.em

// function sanitizeMarca(req: Request, res: Response, next: NextFunction){ 
//   req.body.sanitizedInput = {
//       name: req.body.name,
//       id: req.params.id,
//       nationality: req.body.nationality
//   }
//    Object.keys(req.body.sanitizedInput).forEach(key => { 
//       if(req.body.sanitizedInput[key] === undefined){delete req.body.sanitizedInput[key]}
//    })
//   next()}