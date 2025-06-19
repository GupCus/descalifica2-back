import express, { NextFunction, Request, Response } from 'express'
import { Piloto } from './piloto.js'

const app = express();

app.use(express.json())

const pilotos = [
    new Piloto(
        'Franco Colapinto',
        'Alpine',
        43,
        'Argentino',
        'Segundo piloto',
        '2f6cb93c-1d73-4b1e-90b1-2d50e439084f'
    )
]

function sanitizeCharacterInput(req: Request, res: Response, next: NextFunction){ //Response, Request y NextFunction son de express
    req.body.sanitizedInput = {
        name: req.body.name,
        team: req.body.team,
        nro: req.body.nro,
        nationality: req.body.nationality,
        role: req.body.role,
    }

    next()
}

app.get('/api/pilotos',(req,res)=>{ //get todos los pilotos
    res.json({data: pilotos})
})

app.get('/api/pilotos/:id', (req,res) => { //get para un piloto en específico
    const Persona = pilotos.find((p) => p.id === req.params.id)
    if(!Persona){ //if persona es un undefined (no lo encontró)
        res.status(404).send({message: 'Piloto no encontrado.'})
    }
    res.json({data: Persona})
})

app.post('/api/pilotos/', sanitizeCharacterInput, (req,res) => { //post un nuevo piloto
    const {name, team, nro, nationality, role} = req.body.sanitizedInput //utilizo la input sanitizada

    const piloto = new Piloto(name, team, nro, nationality, role)

    pilotos.push(piloto) //añade el piloto nuevo al final del array 'pilotos'
    res.status(201).send({message: 'Piloto creado correctamente.', data: piloto})
})

app.put('/api/pilotos/:id', sanitizeCharacterInput, (req,res) => { //put de piloto
    const PilotoIdx = pilotos.findIndex((p) => p.id === req.params.id) // .findIndex devuelve la posición en el array del piloto con el id
    
    if(PilotoIdx == -1){
        res.status(404).send({message: 'Character not found.'})
    }

    pilotos[PilotoIdx] = {...pilotos[PilotoIdx], ...req.body.sanitizedInput} // Modifica el objeto en la pos PilotoIdx, pisa el piloto en PilotoIdx con los introducidos que fueron sanitizados previamente

    res.status(200).send({ message: 'Character modificado correctamente.', data: pilotos[PilotoIdx]})
})

app.listen(3000,()=>{
    console.log('Corriendo en http://localhost:3000');
})