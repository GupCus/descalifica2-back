import { Request,Response,NextFunction } from "express"
import { Escuderia } from "./escuderia.entity.js"


function sanitizeEscuderiaInput(req: Request, res: Response, next: NextFunction){ 
  req.body.sanitizedInput = {
      name: req.body.name,
      fundation: req.body.fundation,
      nationality: req.body.nationality,
      engine: req.body.engine,
      id: req.params.id
  }
   Object.keys(req.body.sanitizedInput).forEach(key => { 
      if(req.body.sanitizedInput[key] === undefined){delete req.body.sanitizedInput[key]}
   })
  next()
}

//get todos los Escuderias
function findAll(req:Request,res:Response){
   res.status(500).send({message: 'Not Implemented'});
}

//get para un Escuderia en específico
function findOne(req:Request,res:Response) { 
  res.status(500).send({message: 'Not Implemented'});
}

//post un nuevo Escuderia
function add(req:Request,res:Response){
  
  res.status(500).send({message: 'Not Implemented'});
}

//put&patch de Escuderia
function update(req:Request,res:Response) { 

  res.status(500).send({message: 'Not Implemented'});
}

//Aunque este definida en el repository con un parametro {id: string} de esta forma tenemos la versatilidad de que manden tanto asi como el character entero
function remove(req:Request,res:Response){ 
  res.status(500).send({message: 'Not Implemented'});
}



export {sanitizeEscuderiaInput, findAll, findOne, add, update, remove}