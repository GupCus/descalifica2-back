import { Request,Response,NextFunction } from "express"
import { Piloto } from "./piloto.entity.js"



function sanitizePilotoInput(req: Request, res: Response, next: NextFunction){ //Response, Request y NextFunction son de express
  req.body.sanitizedInput = {
      name: req.body.name,
      team: undefined,
      num: req.body.num,
      nationality: req.body.nationality,
      role: req.body.role,
      id: req.params.id
  }
   Object.keys(req.body.sanitizedInput).forEach(key => { //borra todos los atributos que no nos pasaron en el PATCH, evitamos errores
      if(req.body.sanitizedInput[key] === undefined){delete req.body.sanitizedInput[key]}
   })
  next()
}

//get todos los pilotos
function findAll(req:Request,res:Response){
   res.status(500).send({message: 'Not Implemented'});
}

//get para un piloto en específico
function findOne(req:Request,res:Response) { 
res.status(500).send({message: 'Not Implemented'});
}

//post un nuevo piloto
function add(req:Request,res:Response){
  
res.status(500).send({message: 'Not Implemented'});
}

//put&patch de piloto
function update(req:Request,res:Response) { 

res.status(500).send({message: 'Not Implemented'});
}

//Aunque este definida en el repository con un parametro {id: string} de esta forma tenemos la versatilidad de que manden tanto asi como el character entero
function remove(req:Request,res:Response){ 
res.status(500).send({message: 'Not Implemented'});
}



export {sanitizePilotoInput, findAll, findOne, add, update, remove}