import { Request,Response,NextFunction } from "express"
import { EscuderiaRepository } from "./escuderia.repository.js"
import { Escuderia } from "./escuderia.entity.mem.js"

const repository = new EscuderiaRepository()

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
   res.status(200).send({message: 'Escuderias', data: repository.findAll()});
}

//get para un Escuderia en específico
function findOne(req:Request,res:Response) { 
    const Escuderia = repository.findOne({id:req.params.id})
    if(!Escuderia){ //if Escuderia es un undefined (no lo encontró)
        res.status(404).send({message: 'Escuderia no encontrada.'})
    }
    res.status(200).send({message: 'Escuderia encontrada', data: Escuderia})
}

//post un nuevo Escuderia
function add(req:Request,res:Response){
  
    const input = req.body.sanitizedInput //utilizo la input limpia

    const escuderia = new Escuderia(
      input.name,
      input.fundation,
      input.nationality,
      input.engine
    )

    repository.add(escuderia)
    res.status(201).send({message: 'Escuderia creada correctamente.', data: escuderia})
}

//put&patch de Escuderia
function update(req:Request,res:Response) { 

  const escuderia = repository.update(req.body.sanitizedInput)
  
  if(!escuderia){
      res.status(404).send({message: 'Escuderia no encontrado.'})
  }else{
  res.status(200).send({ message: 'Escuderia modificado correctamente.', data: escuderia})
  }
}

//Aunque este definida en el repository con un parametro {id: string} de esta forma tenemos la versatilidad de que manden tanto asi como el character entero
function remove(req:Request,res:Response){ 
  const escuderia = repository.remove(req.body.sanitizedInput)

  if(!escuderia){
      res.status(404).send({message: 'Escuderia no encontrado.'})
  }else{
      res.status(200).send({message: 'Escuderia borrado correctamente.'})
  }
}



export {sanitizeEscuderiaInput, findAll, findOne, add, update, remove}