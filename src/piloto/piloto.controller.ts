import { Request,Response,NextFunction } from "express"
import { pilotoRepository } from "./piloto.repository.js"
import { Piloto } from "./piloto.entity.mem.js"
import { EscuderiaRepository } from "../escuderia/escuderia.repository.js"

const repository = new pilotoRepository()

function sanitizePilotoInput(req: Request, res: Response, next: NextFunction){ //Response, Request y NextFunction son de express
  req.body.sanitizedInput = {
      name: req.body.name,
      team: (new EscuderiaRepository).findOne({id:req.body.team}),
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
   res.status(200).send({message: 'Pilotos', data: repository.findAll()});
}

//get para un piloto en específico
function findOne(req:Request,res:Response) { 
    const piloto = repository.findOne({id:req.params.id})
    if(!piloto){ //if piloto es un undefined (no lo encontró)
        res.status(404).send({message: 'Piloto no encontrado.'})
    }
    res.status(200).send({message: 'Piloto encontrado', data: piloto})
}

//post un nuevo piloto
function add(req:Request,res:Response){
  
    const input = req.body.sanitizedInput //utilizo la input limpia

    const piloto = new Piloto(
      input.name,
      input.team,
      input.num,
      input.nationality,
      input.role
    )

    repository.add(piloto)
    res.status(201).send({message: 'Piloto creado correctamente.', data: piloto})
}

//put&patch de piloto
function update(req:Request,res:Response) { 

  const piloto = repository.update(req.body.sanitizedInput)
  
  if(!piloto){
      res.status(404).send({message: 'Piloto no encontrado.'})
  }else{
  res.status(200).send({ message: 'Piloto modificado correctamente.', data: piloto})
  }
}

//Aunque este definida en el repository con un parametro {id: string} de esta forma tenemos la versatilidad de que manden tanto asi como el character entero
function remove(req:Request,res:Response){ 
  const piloto = repository.remove(req.body.sanitizedInput)

  if(!piloto){
      res.status(404).send({message: 'Piloto no encontrado.'})
  }else{
      res.status(200).send({message: 'Piloto borrado correctamente.'})
  }
}



export {sanitizePilotoInput, findAll, findOne, add, update, remove}