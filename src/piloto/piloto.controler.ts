import { Request, Response, NextFunction } from "express"
import { PilotoRepository } from "./piloto.repository.js"

const repository = new PilotoRepository()

function sanitizePilotoInput(req: Request, res: Response, next: NextFunction){ //Response, Request y NextFunction son de express
    req.body.sanitizedInput = {
        name: req.body.name,
        team: req.body.team,
        nro: req.body.nro,
        nationality: req.body.nationality,
        role: req.body.role,
    }
     Object.keys(req.body.sanitizedInput).forEach(key => { //borra todos los atributos que no nos pasaron en el PATCH, evitamos errores
        if(req.body.sanitizedInput[key] === undefined){delete req.body.sanitizedInput[key]}
     })
    next()
}

function findAll(req:Request,res:Response) { //get todos los pilotos
    res.json({data: repository.findAll})
}

function findOne(req:Request,res:Response) { //get para un piloto en específico
    const id = req.params.id
    const Persona = repository.findOne({id})
    if(!Persona){ //if persona es un undefined (no lo encontró)
        res.status(404).send({message: 'Piloto no encontrado.'})
    }
    res.status(200).send({message: 'Piloto', data: Persona})
}

function add(req:Request,res:Response) { //post un nuevo piloto
    const input = req.body.sanitizedInput //utilizo la input sanitizada

    const pilotoInput = repository.add(input)
    res.status(201).send({message: 'Piloto creado correctamente.', data: pilotoInput})
}

function update(req:Request,res:Response) { //put de piloto
    req.body.sanitizedInput.id = req.params.id
    const piloto = repository.update(req.body.sanitizedInput)
    
    if(!piloto){
        res.status(404).send({message: 'Character not found.'})
    }

    res.status(200).send({ message: 'Character modificado correctamente.', data: piloto})
}

function remove(req:Request,res:Response) { //no necesita sanitizacion ya que no hay body
    const id = req.params.id
    const piloto = repository.delete({id})
    
    if(!piloto){
        res.status(404).send({message: 'Piloto no encontrado.'})
    }else{
        res.status(200).send({message: 'Piloto borrado correctamente.'})
    }
}

export {sanitizePilotoInput, findAll, findOne, update, remove, add}
